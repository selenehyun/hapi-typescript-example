'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as Joi from 'joi';
import { Server, Request, IReply } from 'hapi';
import { Options } from 'glue';

// this == Glue
export function register (server: Server, options: Object, next: any) {
    server.route({
        method: 'GET',
        path: '/',
        handler: (req: Request, reply: IReply) => {
            reply({ message: 'welcome to my api' });
        },
    });

    const loadControllers = (dirPath: string) => {
        fs.readdirSync(dirPath).forEach((dir) => {
            if (!/\./.test(dir)) {
                return loadControllers(path.resolve(dirPath, dir));
            } else if (/.\.controller\.ts$/.test(dir)) {
                require(path.resolve(dirPath, dir)).default(server);
            } else return false;
        });
    };
    loadControllers(__dirname);

    next();
};

exports.register.attributes = {
    name: 'api',
};
