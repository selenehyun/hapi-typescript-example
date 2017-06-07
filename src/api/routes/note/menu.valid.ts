import * as Joi from 'joi';
import { NoteMenuModel, NoteModel } from './../../../models';

export const addMenu = {
    payload: {
        // name: (NoteMenuModel.name as Joi.StringSchema).required(),
        text: (NoteMenuModel.text as Joi.StringSchema).required(),
        groups: Joi.array(),
    },
};
