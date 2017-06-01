'use strict';

import Composer from './index';
import { Server } from 'hapi';

Composer((err: Error, server: Server) => {
    if (err) throw err;

    server.start((error: Error) => {
        if (error) throw error;

        console.log(`Started the Server on port`, server.info.port);
    });
});
