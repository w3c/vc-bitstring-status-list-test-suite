/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {addPerTestMetadata} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';

// only use implementations with `BitstringStatusList` tags.
const {match: issuerMatches} = endpoints.filterByTag({
  property: 'issuers',
  tags: ['BitstringStatusList']
});

const {match: verifierMatches} = endpoints.filterByTag({
  property: 'verifiers',
  tags: ['BitstringStatusList']
});

function setupMatrix() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...verifierMatches.keys()];
  this.rowLabel = 'Issuer';
  this.columnLabel = 'Verifier';
}

describe('BitstringStatusList Credentials (Interop)', function() {
  // this will tell the report
  // to make an interop matrix with this suite
  setupMatrix.call(this);
  for(const [issuerName] of issuerMatches) {
    beforeEach(addPerTestMetadata);
    for(const [verifierName] of verifierMatches) {
      it(`${verifierName} should verify ${issuerName}`, async function() {
        this.test.cell = {rowId: issuerName, columnId: verifierName};
        this.test.cell.skipMessage = 'Pending interop tests.';
        this.skip();
        // should.not.exist(err);
        // should.exist(vc);
        // const body = createRequestBody({vc});
        // shouldPassVerification({result, error, statusCode});
      });
    }
  }
});
