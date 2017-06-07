'use strict';

import * as Joi from 'joi';

export interface INoteMenu {
    idx: number | Joi.NumberSchema;
    name: string | Joi.StringSchema;
    text: string | Joi.StringSchema;
}
export interface INote {
    idx: number | Joi.NumberSchema;
    menu_idx: number | Joi.NumberSchema;
    user_idx: number | Joi.NumberSchema;
    subject: string | Joi.StringSchema;
    body: string | Joi.StringSchema;
    created_at?: string | Joi.DateSchema;
    updated_at?: string | Joi.DateSchema;
}

export const MenuSchema: INoteMenu = {
    idx: Joi.number().integer().min(1),
    name: Joi.string().min(1).max(64).description('Menu Unique Name'),
    text: Joi.string().min(1).max(64).description('Menu Title'),
};

export const Schema: INote = {
    idx: Joi.number().integer().min(1),
    menu_idx: Joi.number().integer().min(1),
    user_idx: Joi.number().integer().min(1),
    subject: Joi.string().min(1).max(64),
    body: Joi.string(),
};
