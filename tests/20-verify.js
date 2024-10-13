/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
  addPerTestMetadata,
  setupMatrix,
} from './helpers.js';
import {filterByTag} from
  'vc-test-suite-implementations';

const tag = 'BitstringStatusList';
const {match} = filterByTag({tags: [tag]});

describe('BitstringStatusList Credentials (Verify)', function() {
  setupMatrix.call(this, match);
  for(const [name] of match) {
    describe(name, function() {
      beforeEach(addPerTestMetadata);
      it('MUST verify a valid "BitstringStatusListCredential" with ' +
                '"revocation" status purpose', async function() {
        this.test.cell.skipMessage = 'Pending verifier tests.';
        this.skip();
      });
      it('MUST verify a valid "BitstringStatusListCredential" with ' +
                '"suspension" status purpose', async function() {
        this.test.cell.skipMessage = 'Pending verifier tests.';
        this.skip();
      });
      it('MUST fail to verify a VC with invalid ' +
                '"credentialStatus.statusListCredential"', async function() {
        this.test.cell.skipMessage = 'Pending verifier tests.';
        this.skip();
      });
      it('MUST fail to verify a VC with invalid "credentialStatus.type"',
        async function() {
          this.test.cell.skipMessage = 'Pending verifier tests.';
          this.skip();
        });
      it('MUST fail to verify a revoked status list credential',
        async function() {
          this.test.cell.skipMessage = 'Pending verifier tests.';
          this.skip();
        });
      it('MUST fail to verify a suspended status list credential',
        async function() {
          this.test.cell.skipMessage = 'Pending verifier tests.';
          this.skip();
        });
    });
  }
});
