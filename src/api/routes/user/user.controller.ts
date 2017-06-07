import { IReply, Request, Server } from 'hapi';

export default (server: Server) => {
    // Get Self Info
    server.route({
        method: 'GET',
        path: '/self',
        handler: (req: Request, reply: IReply) => {
            // credentials.user 정보는 token을 받아서 유저정보를 가져오는것 이므로 최신정보임.
            reply(req.auth.credentials.user);
        },
    });
};
