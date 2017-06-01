import { UserModel } from '../../../../models';
import { NumberSchema } from 'joi';

export const getUser = {
    params: {
        idx: (<NumberSchema>UserModel.idx).required(),
    }
};