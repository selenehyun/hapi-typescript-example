'use strict';

import * as Confidence from 'confidence';
import { IMysqlPlugin } from './src/plugin/mysql-plugin';

// Mysql Plugin Config
const database: IMysqlPlugin = {
    Pools: {
        center: {
            host: '...',
            user: '...',
            password: '...',
            database: '...',
        },
    },
    ClusterPools: {
        ccn: {
            HOSTS: {
                MASTER: 'your-host',
                SLAVE: [
                    'your-slave-host',
                ],
            },
            user: '...',
            password: '...',
            database: '...',
        },
    },
};

const config = {
    $meta: 'This file configures the plot device.',
    database,
    port: {
        api: {
            $filter: 'env',
            $default: 8080,
            test: 9090,
        },
    },
    projectName: 'hapi-typescript-example',
    jwt: {
        secretKey: 'developers-hapi-tim-eddie',
    },
    bcrypt: {
        salt: 10,
    },
};

const store = new Confidence.Store(config);
const criteria = {
    env: process.env.NODE_ENV,
};
export const get = (key: string) => {
    return store.get(key, criteria);
};
export const meta = (key: string) => {
    return store.meta(key, criteria);
};
