'use strict';

import * as Glue from 'glue';
import * as Manifest from './manifest';

const composeOptions = {
    relativeTo: __dirname,
};

export default Glue.compose.bind(Glue, Manifest.get('/'), composeOptions);
