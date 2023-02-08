/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {createRequestBody, createValidVc} from './helpers.js';
import {filterByTag, filterImplementations} from
  'vc-api-test-suite-implementations';
import {shouldFailVerification, shouldPassVerification} from './assertions.js';
import {klona} from 'klona';

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
      let validVcForRevocation;
      let validVcForSuspension;
      before(async function() {
        // get a VC issued by DB
        const {match} = filterImplementations({filter: ({value}) => {
          // FIXME: Make issuer name configurable via env variable
          return value.settings.name === 'Digital Bazaar';
        }});
        const {issuers} = match.get('Digital Bazaar');
        const issuer1 = issuers.find(issuer => issuer.tags.has('Revocation'));
        const credential1 = createValidVc({issuer: issuer1});
        const {data: data1} = await issuer1.post(
          {json: {credential: credential1}});
        validVcForRevocation = data1;
        const issuer2 = issuers.find(issuer => issuer.tags.has('Suspension'));
        const credential2 = createValidVc({issuer: issuer2});
        const {data: data2} = await issuer1.post(
          {json: {credential: credential2}});
        validVcForSuspension = data2;
      });
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
        const invalidStatusListCredential = klona(validVcForRevocation);
        invalidStatusListCredential.credentialStatus.statusListCredential =
          'invalid-statusListCredential';
        const {result, error, statusCode} = await verifier.post({
          json: createRequestBody({vc: invalidStatusListCredential})
        });
        shouldFailVerification({result, error, statusCode});
      });
      it('MUST fail to verify a VC with invalid "credentialStatus.type"',
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const invalidCredentialStatusType = klona(validVcForRevocation);
          invalidCredentialStatusType.credentialStatus.type = 'invalid-type';
          const {result, error, statusCode} = await verifier.post({
            json: createRequestBody({vc: invalidCredentialStatusType})
          });
          shouldFailVerification({result, error, statusCode});
        });
    });
  }
});
