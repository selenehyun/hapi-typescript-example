'use strict';

import * as Lab from 'lab';
import * as Code from 'code';
import * as Hapi from 'hapi';
import * as Config from '../../../config';
import * as ApiPlugin from '../../../src/api';

export const lab = Lab.script();
let request;
let server;

lab.beforeEach((done) => {
    const plugins = [ApiPlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/api') });
    server.register(plugins, (err) => {
        if (err) return done(err);

        done();
    });
});

lab.experiment('Index Plugin', () => {
    lab.beforeEach((done) => {
        request = {
            method: 'GET',
            url: '/'
        };

        done();
    });

    lab.test('it returns "/" message', (done) => {
        server.inject(request, (response) => {
            Code.expect(response.result.message).to.match(/welcome to my api/i);
            Code.expect(response.statusCode).to.equal(200);

            done();
        });
    });
});
