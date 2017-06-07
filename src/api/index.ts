'use strict';

import * as fs from 'fs';
import { Options } from 'glue';
import { IReply, Request, Server } from 'hapi';
import * as Joi from 'joi';
import * as path from 'path';

// this == Glue
export function register(server: Server, options: Options, next: any) {
    server.route({
        handler: (req: Request, reply: IReply) => {
            reply({ message: 'welcome to my api' });
        },
        method: 'GET',
        path: '/',
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

    console.log('Registered API Route.');
    next();
}

exports.register.attributes = {
    name: 'api',
};
