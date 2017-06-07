'use strict';

import * as Joi from 'joi';

export interface IUser {
    idx: number | Joi.NumberSchema;
    username: string | Joi.StringSchema;
    email?: string | Joi.StringSchema;
    name?: string | Joi.StringSchema;
    password?: string | Joi.StringSchema;
    orgPassword?: string | Joi.StringSchema;
    groups?: string[] | Joi.ArraySchema;
    joined_at?: string | Joi.DateSchema;
}

export const disallowedUsername = [
    'admin', 'developer',
    'software', 'hardware',
    'ecubelabs', 'ecubelab',
];

export const Schema: IUser = {
    idx: Joi.number().integer().min(1),
    username: Joi.string().min(3).max(32).regex(/^[a-zA-Z\-_0-9]{3,}$/gi).disallow(disallowedUsername),
    email: Joi.string().email(),
    name: Joi.string().min(2).max(64),
    password: Joi.string().description('bcrypt password string').length(72),
    orgPassword: Joi.string().description('raw password string').min(4),
    groups: Joi.array().description('user group types'),
    joined_at: Joi.date(),
};
