'use strict';

// import { Options } from "glue";
import { Request, Server, ServerConnection } from 'hapi';
import * as mysql from 'mysql';

interface IAnyKeys {
    [key: string]: any;
}

interface IMysqlPluginConnectionConfig {
    [key: string]: any;
    host?: string;
    user: string;
    password: string;
    database: string;
}

interface IMysqlPluginClusterPoolConfig extends IMysqlPluginConnectionConfig {
    HOSTS: {
        // [host: string]: string,
        MASTER: string,
        SLAVE: {
            [index: number]: string,
        },
    };
}

interface IConfigCollection<T> {
    [key: string]: any;
}

export interface IMysqlPlugin {
    Pools?: {
        [key: string]: IMysqlPluginConnectionConfig,
    };
    ClusterPools?: {
        [key: string]: IMysqlPluginClusterPoolConfig,
    };
}

/**
 * ##queryLoggingWrapper
 * - overriding POOL.query
 * - SQL 및 소요시간 로그
 * @param {String} sql
 * @param {String[]} [values]
 * @param {Function} callback
 */
function queryLoggingWrapper(this: any, sql: string, values?: any[], callback?: () => any) {
    if (!callback && typeof values === 'function') {
        callback = values;
        values = [];
    }

    let opt: object | string | any;
    if (typeof sql === 'string') {
        opt = { sql, values };
    } else {
        opt = sql;
    }

    const startTime = new Date().getTime();
    // console.log(this);
    this._query(opt, (err: Error, rows: mysql.RowDataPacket[], fields: mysql.FieldPacket[]) => {
        const formattedSql = mysql.format(opt.sql, opt.values);
        if (err) {
            console.error(formattedSql.red, err);
        } else {
            const takeTimes = new Date().getTime() - startTime;
            console.log((takeTimes + ' ms, len: ' + (rows ? rows.length : undefined) + ', ' + formattedSql).gray);
        }

        if (callback !== undefined) callback.call(this, err, rows, fields);
    });
}

/**
 * ## commitReleaseWrapper
 * connection을 bind해주고 사용해야 함.
 * 트랜잭션 커밋 후 에러가 나지 않으면 커넥션을 릴리즈해줍니다.
 *
 * @param {function} callback
 */
function commitReleaseWrapper(this: any, callback: () => any) {
    this.commit((err: Error) => {
        if (err) return callback.call(this, err);
        this.release();
        callback();
    });
}

/**
 * ## rollbackReleaseWrapper
 * connection을 bind해주고 사용해야 함.
 * 트랜잭션 롤백 후 커넥션을 릴리즈해줍니다.
 *
 * @param {any} callback
 */
function rollbackReleaseWrapper(this: any, callback: () => any) {
    this.rollback(() => {
        this.release();
        callback();
    });
}

// 생성된 Pool 또는 PoolCluster를 담고있는 변수
export const POOL: IAnyKeys = {};

const existPoolName = (name: string): boolean => {
    return Object.keys(POOL).indexOf(name) !== -1;
};

const addPools = (config: any) => {
    Object.keys(config as object).map((key) => {
        if (existPoolName(key)) throw new Error('[Mysql Plugin] Duplicated Pool Key.');
        POOL[key] = mysql.createPool(config[key]);
        console.log(`[Mysql Plugin] POOL Loaded "${key}"`);
    });
};
const addClusters = (config: any) => {
    Object.keys(config).map((key) => {
        if (existPoolName(key)) throw new Error('[Mysql Plugin] Duplicated Pool Key.');
        const { HOSTS, user, password, database } = config[key];
        const _CLUSTER = mysql.createPoolCluster();
        const addHost = (key: string, host: string) => {
            const conf: any = {
                host,
                user,
                password,
                database,
            };
            _CLUSTER.add(key, conf);
        };

        addHost('MASTER', HOSTS.MASTER);
        HOSTS.SLAVE.map((host: string, k: number) => {
            addHost(`SLAVE${Number(k) + 1}`, host);
        });

        console.log(`[Mysql Plugin] POOL Loaded "${key}"`);
        POOL[key] = _CLUSTER;
    });
};

export function register(server: Server, options: IMysqlPlugin, next: any) {
    addPools(options.Pools);
    addClusters(options.ClusterPools);

    // POOL.query와 POOL.getConnection해서 얻은 connection.query를 전부 queryLoggingWrapper로 래핑하기
    Object.keys(POOL).map((poolname) => {
        const _POOL = POOL[poolname];
        const isCluster = _POOL.constructor.name === 'PoolCluster';
        if (isCluster) {
            let __POOL = _POOL.of('MASTER'); // 실제로 getConnection할수 있는 객체를 넣어놈

            // query 기능 구현
            _POOL._query = (sql: string | any, values?: any[], callback?: () => any) => {
                if (!callback && typeof values === 'function') {
                    callback = values;
                    values = [];
                }
                if (typeof sql === 'object') {
                    values = sql.values;
                    sql = sql.sql;
                }
                if (sql.toLowerCase().startsWith('select')) __POOL = _POOL.of('SLAVE*', 'ORDER');
                __POOL.getConnection((err: Error, connection: mysql.PoolConnection) => {
                    if (err) return callback !== undefined ? callback.call(null, err) : false;
                    connection.query(sql, values || [], (err, rows) => {
                        if (callback !== undefined) return callback.call(null, err, rows);
                        connection.release();
                    });
                });
            };
            _POOL.query = queryLoggingWrapper.bind(_POOL);
        } else {
            _POOL._query = _POOL.query;
            _POOL.query = queryLoggingWrapper.bind(_POOL);
        }

        _POOL.getConn = (callback: () => any) => {
            (isCluster ? _POOL.of('MASTER') : _POOL)
            .getConnection((err: Error, connection: mysql.PoolConnection | any) => {
                if (err) return callback.call(null, err);
                if (!connection._query) {
                    connection._query = connection.query;
                }
                connection.query = queryLoggingWrapper.bind(connection);
                connection.commitRelease = commitReleaseWrapper.bind(connection);
                connection.rollbackRelease = rollbackReleaseWrapper.bind(connection);
                connection.beginTransaction((err: Error) => {
                    if (err) return callback.call(null, err);
                    callback.call(null, null, connection);
                });
            });
        };

    });

    server.decorate('server', 'db', () => POOL);
    server.decorate('request', 'db', () => POOL);

    console.log('Registered Mysql Plugin');
    return next();
}

exports.register.attributes = {
    name: 'mysqlPlugin',
    pkg: {
        version: '1.0.0',
    },
};
