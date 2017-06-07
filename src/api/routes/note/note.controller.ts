import { IReply, Request, Server } from 'hapi';
import { RowDataPacket } from 'mysql';
import { get } from '../../../../config';

export default (server: Server) => {
    const db = (server as any).db();

};
