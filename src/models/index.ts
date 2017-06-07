import * as Note from './Note';
import * as User from './User';

export default {
    Note,
    User,
};

export const UserModel: User.IUser = User.Schema;
export const NoteModel: Note.INote = Note.Schema;
export const NoteMenuModel: Note.INoteMenu = Note.MenuSchema;
