'use strict';

import * as Confidence from 'confidence';
const criteria = {
    env: process.env.NODE_ENV
};
const config = {
    $meta: 'This file configures the plot device.',
    projectName: 'hapi-typescript-example',
    port: {
        api: {
            $filter: 'env',
            test: 9090,
            $default: 8080
        }
    }
};

const store = new Confidence.Store(config);

export const get = function (key: string) {
    return store.get(key, criteria);
};
export const meta = function (key: string) {
    return store.meta(key, criteria);
};
