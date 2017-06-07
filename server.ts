'use strict';

import { Server } from 'hapi';
import { get } from './config';
import Composer from './index';
import { validate } from './src/lib/jwt';

Composer((err: Error, server: Server) => {
    if (err) throw err;

    // Console Colors
    require('colors');

    server.auth.strategy('jwt', 'jwt', {
        key: get('/jwt/secretKey'),
        validateFunc: validate,
        verifyOptions: { algorithms: ['HS256'] },
    });
    server.auth.default('jwt');

    server.start((err: Error) => {
        if (err) throw err;

        console.log(`Started the Server on port:`.blue, ` ${server.info.port} `.bold.bgBlue);
    });
});
