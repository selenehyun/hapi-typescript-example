'use strict';

import * as Confidence from 'confidence';
import * as Config from './config';

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        debug: {
            request: ['error'],
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/api'),
        labels: ['api']
    }],
    registrations: [
        {
            plugin: './src/api'
        }
    ]
};

const store = new Confidence.Store(manifest);

export const get = (key: string) => store.get(key, criteria);
export const meta = (key: string) => store.meta(key, criteria);
