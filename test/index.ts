'use strict';

import * as Code from 'code';
import { Server } from 'hapi';
import * as Lab from 'lab';
import Composer from '../index';

export const lab = Lab.script();

lab.experiment('App', () => {
    lab.test('it composes a server', (done) => {
        Composer((err: Error, composedServer: Server) => {
            Code.expect(composedServer).to.be.an.object();
            done(err);
        });
    });
});
