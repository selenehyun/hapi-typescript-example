import * as async from 'async';
import * as bcrypt from 'bcrypt';
import * as boom from 'boom';
import { IReply, Request, Server } from 'hapi';
import * as JWT from 'jsonwebtoken';
import { RowDataPacket } from 'mysql';
import { get } from '../../../../config';
import * as valid from './auth.valid';

export default (server: Server) => {
    const db = (server as any).db();

    server.route({
        method: 'POST',
        path: '/join',
        config: {
            auth: false,
            description: 'Join User',
            tags: ['User', 'Auth', 'bcrypt', 'Join'],
            validate: valid.join,
        },
        handler: (req: Request, reply: IReply) => {
            const { username, email } = req.payload;

            async.series({
                // check duplicated username, email
                checkDuplicate: (callback: () => void) => {
                    const sql = 'SELECT idx, username, email FROM users WHERE username = ? OR email = ?;';
                    db.center.query(sql, [username, email], (err: Error, rows: RowDataPacket) => {
                        if (err) return callback.call(null, err);
                        if (rows.length) return callback.call(null, boom.badRequest('duplicated username or email', rows));
                        callback();
                    });
                },
                join: (callback: () => void) => {
                    req.payload.password = bcrypt.hashSync(req.payload.password, get('/bcrypt/salt'));

                    const sql = 'INSERT INTO users SET ?;';
                    db.center.query(sql, [req.payload], (err: Error) => {
                        if (err) return callback.call(null, err);
                        callback();
                    });
                },
            }, (err: Error) => {
                reply.call(null).code(201);
            });
        },
    });

    server.route({
        method: 'POST',
        path: '/auth',
        config: {
            auth: false,
            description: 'Login User',
            tags: ['User', 'JWT', 'bcrypt', 'Auth', 'Login'],
        },
        handler: (req: Request, reply: IReply) => {
            db.center.query('SELECT * FROM users WHERE username = ? limit 1;', [req.payload.username], (err: Error, rows: RowDataPacket) => {
                if (err) return reply(err);
                if (!rows.length) return reply(boom.badRequest('not found user'));
                if (!bcrypt.compareSync(req.payload.password, rows[0].password)) {
                    return reply(boom.badRequest('Password incorrect'));
                }

                delete rows[0].password;

                // JWT Sign
                const token = JWT.sign(rows[0], get('/jwt/secretKey'), { expiresIn: '7d' });
                reply({
                    token,
                    user: rows[0],
                });
            });
        },
    });
};
