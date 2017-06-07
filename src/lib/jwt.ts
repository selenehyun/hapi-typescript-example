import * as boom from 'boom';
import { Request } from 'hapi';
import { RowDataPacket } from 'mysql';

export const validate = (decoded: any, req: Request, callback: () => any) => {
    const db = (req as any).db();

    // IDX Key 없으면 에러
    if (!decoded.idx) return callback.call(null, boom.unauthorized('Bad token'), false);

    const userSQL = 'SELECT users.*, GROUP_CONCAT(pg.name SEPARATOR \'|\') as groups FROM users LEFT JOIN relation_user_group as ug ON ug.user_idx = users.idx LEFT JOIN permission_groups as pg ON pg.idx = ug.group_idx WHERE users.idx = ? GROUP BY users.idx LIMIT 1;';
    db.center.query(userSQL, [decoded.idx], (err: Error, rows: RowDataPacket) => {
        if (err) return callback.call(null, err);
        if (!rows.length) return callback.call(null, boom.unauthorized('Not found user'), false);

        if (rows[0].groups) {
            rows[0].groups = rows[0].groups.split('|');
        } else {
            rows[0].groups = [];
        }
        return callback.call(null, null, true, { decoded, user: rows[0] });
    });
};
