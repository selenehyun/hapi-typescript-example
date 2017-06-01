'use strict';

import * as Lab from 'lab';
import * as Code from 'code';
import * as Config from '../config';

export const lab = Lab.script();

lab.experiment('Config', () => {
    lab.test('it gets config data', (done) => {
        Code.expect(Config.get('/')).to.be.an.object();
        done();
    });

    lab.test('it gets config meta data', (done) => {
        Code.expect(Config.meta('/')).to.match(/this file configures the plot device/i);
        done();
    });
});
