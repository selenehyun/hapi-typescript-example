'use strict';

import * as Joi from 'joi';

export interface IUser {
    idx: number | Joi.NumberSchema;
    name: string | Joi.StringSchema;
};

export const Schema: IUser = {
    idx: Joi.number().integer().min(1),
    name: Joi.string(),
};