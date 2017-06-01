'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as Joi from 'joi';
import { Server } from 'hapi';
import { Options } from 'glue';

// this == Glue
export function register (server: Server, options: Object, next: any) {
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
