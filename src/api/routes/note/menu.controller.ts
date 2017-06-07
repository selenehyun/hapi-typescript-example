import * as async from 'async';
import * as boom from 'boom';
import { IReply, Request, Server } from 'hapi';
import { RowDataPacket } from 'mysql';
import { get } from '../../../../config';
import { validPerm } from './../../../helpers/user.helper';
import * as valid from './menu.valid';

export default (server: Server) => {
    const db = (server as any).db();

    server.route({
        method: 'GET',
        path: '/note/menus',
        config: {
            description: 'Get All Note Menu',
            tags: ['Menu'],
        },
        handler: (req: Request, reply: IReply) => {
            const { user: { groups = [] } } = req.auth.credentials;

            const sql = 'SELECT note_menus.idx, note_menus.text FROM note_menus LEFT JOIN relation_note_menu_group as mg ON mg.menu_idx = note_menus.idx LEFT JOIN permission_groups as pg ON pg.idx = mg.group_idx WHERE mg.menu_idx is null or pg.name in (?) GROUP BY note_menus.idx';
            db.center.query(sql, [groups.length ? groups : 1], (err: Error, rows: RowDataPacket) => {
                if (err) return reply.call(null, err);
                reply(rows);
            });
        },
    });

    server.route({
        method: 'POST',
        path: '/note/menu',
        config: {
            description: 'Add Note Menu',
            tags: ['Menu'],
            validate: valid.addMenu,
        },
        handler: (req: Request, reply: IReply) => {
            const { text, groups= [] } = req.payload;

            db.center.getConn((err: Error, conn: any) => {
                if (err) return reply.call(null, err);

                let menuIdx: number;
                async.series({
                    // Check Groups(permission check)
                    checkPermission: (callback: () => any) => {
                        const { user: { groups = [] } } = req.auth.credentials;
                        if (!groups.length) return callback.call(null, boom.badRequest('invalid permission groups', { groups }));

                        validPerm(groups, ['EcubeLabs'], callback);
                    },
                    // Check duplicated Note Menu text.
                    checkDuplicate: (callback: () => void) => {
                        const sql = 'SELECT * FROM note_menus WHERE text = ?;';
                        conn.query(sql, [text], (err: Error, rows: RowDataPacket) => {
                            if (err) return callback.call(null, err);
                            if (rows.length) return callback.call(null, boom.badRequest('duplicated menu text', rows));
                            callback();
                        });
                    },

                    add: (callback: () => void) => {
                        const sql = 'INSERT INTO note_menus SET ?;';
                        conn.query(sql, [{ text }], (err: Error, rs: RowDataPacket) => {
                            if (err) return callback.call(null, err);
                            menuIdx = rs.insertId;
                            callback();
                        });
                    },
                    addGroups: (callback: () => void) => {
                        if (!groups.length) return callback();

                        const sql = 'SELECT * FROM permission_groups WHERE name in (?) OR is_default = 1';
                        conn.query(sql, [groups], (err: Error, rows: RowDataPacket) => {
                            if (err) return callback.call(null, err);

                            const sql = 'INSERT INTO relation_note_menu_group (menu_idx, group_idx) VALUES ?;';
                            const data = rows.map((r: any) => [menuIdx, r.idx]);
                            conn.query(sql, [data], (err: Error) => callback.call(null, err));
                        });
                    },

                    commit: (callback: () => void) => conn.commitRelease((err: Error) => callback.call(null, err)),
                }, (err: Error) => {
                    if (err) return conn.rollbackRelease(() => reply.call(null, err));
                    reply.call(null).code(201);
                });
            });
        },
    });
};
