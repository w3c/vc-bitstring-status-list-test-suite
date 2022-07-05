/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {createRequestBody} from './helpers.js';
import {filterByTag} from 'vc-api-test-suite-implementations';
import {shouldFailVerification, shouldPassVerification} from './assertions.js';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const invalidCredentialStatusType =
  require('../static-vcs/invalidCredentialStatusType.json');
const invalidStatusListCredentialId =
  require('../static-vcs/invalidStatusListCredentialId.json');
const validVcForRevocation = require('../static-vcs/validVcForRevocation.json');
const validVcForSuspension = require('../static-vcs/validVcForSuspension.json');

// only use implementations with `StatusList2021` verifiers.
const {match, nonMatch} = filterByTag({
  property: 'verifiers',
  tags: ['StatusList2021']
});

describe('StatusList2021 Credentials (Verify)', function() {
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Verifier';
  this.notImplemented = [...nonMatch.keys()];
  for(const [verifierName, {verifiers}] of match) {
    describe(verifierName, function() {
      const verifier = verifiers.find(verifier =>
        verifier.tags.has('StatusList2021'));
      it('MUST verify a valid "StatusList2021Credential" with "revocation" ' +
        'status purpose', async function() {
        this.test.cell = {columnId: verifierName, rowId: this.test.title};
        const {result, error, statusCode} = await verifier.post({
          json: createRequestBody({vc: validVcForRevocation})
        });
        shouldPassVerification({result, error, statusCode});
      });
      it('MUST verify a valid "StatusList2021Credential" with "suspension"' +
        'status purpose', async function() {
        this.test.cell = {columnId: verifierName, rowId: this.test.title};
        const {result, error, statusCode} = await verifier.post({
          json: createRequestBody({vc: validVcForSuspension})
        });
        shouldPassVerification({result, error, statusCode});
      });
      it('MUST fail to verify a VC with invalid ' +
        '"credentialStatus.statusListCredential"', async function() {
        this.test.cell = {columnId: verifierName, rowId: this.test.title};
        const {result, error, statusCode} = await verifier.post({
          json: createRequestBody({vc: invalidStatusListCredentialId})
        });
        shouldFailVerification({result, error, statusCode});
      });
      it('MUST fail to verify a VC with invalid "credentialStatus.type"',
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const {result, error, statusCode} = await verifier.post({
            json: createRequestBody({vc: invalidCredentialStatusType})
          });
          shouldFailVerification({result, error, statusCode});
        });
    });
  }
});
