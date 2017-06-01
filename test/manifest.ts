'use strict';

import * as Lab from 'lab';
import * as Code from 'code';
import * as Manifest from '../manifest';

export const lab = Lab.script();

lab.experiment('Manifest', () => {

    lab.test('it gets manifest data', (done) => {

        Code.expect(Manifest.get('/')).to.be.an.object();
        done();
    });


    lab.test('it gets manifest meta data', (done) => {

        Code.expect(Manifest.meta('/')).to.match(/this file defines the plot device/i);
        done();
    });
});
