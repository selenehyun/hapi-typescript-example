import { Server, Request, IReply } from 'hapi';
import * as valid from './user.valid';

export default (server: Server) => {
    // Get User Detail Info
    server.route({
        method: 'GET',
        path: '/user/{idx}',
        handler: (req: Request, reply: IReply) => {
            reply({ name: req.params.idx });
        },
        config: {
            validate: valid.getUser
        },
    });
};
