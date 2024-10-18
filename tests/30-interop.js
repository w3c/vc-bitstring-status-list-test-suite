/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {addPerTestMetadata, issueValidVc} from './helpers.js';
import assert from 'node:assert/strict';
import {filterByTag} from 'vc-test-suite-implementations';
import {TestEndpoints} from './TestEndpoints.js';

// only use implementations with `BitstringStatusList` tags.
const tag = 'BitstringStatusList';
const {match} = filterByTag({tags: [tag]});

function setupMatrix() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Issuer';
  this.columnLabel = 'Verifier';
}

describe('Interop', function() {
  setupMatrix.call(this, match);
  for(const [issuerName, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    let issuedVc;
    beforeEach(addPerTestMetadata);
    before(async function() {
      issuedVc = await issueValidVc(endpoints, issuerName);
    });
    for(const [verifierName, implementation] of match) {
      const endpoints = new TestEndpoints({implementation, tag});
      it(`${verifierName} should verify ${issuerName}`, async function() {
        this.test.cell = {rowId: issuerName, columnId: verifierName};
        await assert.doesNotReject(endpoints.verify(issuedVc));
      });
    }
  }
});
