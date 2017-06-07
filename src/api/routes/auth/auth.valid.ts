import { StringSchema } from 'joi';
import { UserModel } from './../../../models';

export const join = {
    payload: {
        username: (UserModel.username as StringSchema).required(),
        email: (UserModel.email as StringSchema).required(),
        name: (UserModel.name as StringSchema),
        password: (UserModel.orgPassword as StringSchema).required(),
    },
};
