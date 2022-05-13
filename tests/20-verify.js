/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const {createRequestBody} = require('./helpers.js');
const {filterByTag} = require('vc-api-test-suite-implementations');
const invalidCredentialStatusType =
  require('../static-vcs/invalidCredentialStatusType.json');
const invalidStatusListCredentialId =
  require('../static-vcs/invalidStatusListCredentialId.json');
const validVc = require('../static-vcs/validVc.json');

const should = chai.should();

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
      it('MUST verify a valid "StatusList2021Credential"',
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const {result, error} = await verifier.post({
            json: createRequestBody({vc: validVc})
          });
          should.exist(result);
          should.not.exist(error);
        });
      it('MUST fail to verify a VC with invalid ' +
      '"credentialStatus.statusListCredential"', async function() {
        this.test.cell = {columnId: verifierName, rowId: this.test.title};
        const {result, error} = await verifier.post({
          json: createRequestBody({vc: invalidStatusListCredentialId})
        });
        should.not.exist(result);
        should.exist(error);
        should.exist(error.data);
        // verifier returns 400
        error.status.should.equal(400);
        error.data.verified.should.equal(false);
        const {check} = error.data.checks[0];
        check.should.be.an('array');
        check.should.include.members(['credentialStatus', 'proof']);
      });
      it('MUST fail to verify a VC with invalid "credentialStatus.type"',
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const {result, error} = await verifier.post({
            json: createRequestBody({vc: invalidCredentialStatusType})
          });
          should.not.exist(result);
          should.exist(error);
          should.exist(error.data);
          // verifier returns 400
          error.status.should.equal(400);
          error.data.verified.should.equal(false);
        });
    });
  }
});
