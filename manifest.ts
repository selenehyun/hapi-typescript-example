'use strict';

import * as Confidence from 'confidence';
import * as Config from './config';

const criteria = {
    env: process.env.NODE_ENV,
};

const manifest = {
    $meta: 'This file defines the plot device.',
    connections: [{
        labels: ['api'],
        port: Config.get('/port/api'),
    }],
    server: {
        connections: {
            routes: {
                security: true,
            },
        },
        debug: {
            request: ['error'],
        },
    },
    registrations: [
        {
            plugin: {
                register: './src/plugin/mysql-plugin',
                options: Config.get('/database'),
            },
        },
        {
            plugin: 'hapi-auth-jwt2',
        },
        {
            plugin: './src/api',
            options: {
                routes: {
                    prefix: '/v1',
                },
            },
        },
    ],
};

const store = new Confidence.Store(manifest);

export const get = (key: string) => store.get(key, criteria);
export const meta = (key: string) => store.meta(key, criteria);
