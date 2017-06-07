import * as boom from 'boom';

const validateOrPermission = (groups: string[], allowedGroups: string[]) => {
    for (const allowedGroup of allowedGroups) {
        if (groups.indexOf(allowedGroup) !== -1) {
            return true;
        }
    }
    return false;
};

const validateAndPermission = (groups: string[], allowedGroups: string[]) => {
    for (const allowedGroup of allowedGroups) {
        if (groups.indexOf(allowedGroup) === -1) {
            return false;
        }
    }
    return true;
};

export const validPerm = (groups: string[], allowedGroups: string[], callback: (err?: boom.BoomError) => void, operator: string = 'or') => {
    if (allowedGroups.indexOf('Admin') === -1) allowedGroups.push('Admin');

    switch (operator) {
        case 'or':
            if (!validateOrPermission(groups, allowedGroups)) {
                return callback.call(null, boom.badRequest('invalid permission groups', { groups }));
                // return false;
            }
            break;
        case 'and':
            if (!validateAndPermission(groups, allowedGroups)) {
                return callback.call(null, boom.badRequest('invalid permission groups', { groups }));
                // return false;
            }
            break;
        default:
            return callback.call(null, boom.badRequest('invalid permission groups', { groups }));
    }
    return callback.call(null);
};
