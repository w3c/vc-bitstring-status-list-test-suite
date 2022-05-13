/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const {filterByTag} = require('vc-api-test-suite-implementations');
const {createValidVc, createRequestBody, getCredentialStatus} =
  require('./helpers.js');
const {klona} = require('klona');

const should = chai.should();

// only use implementations with `StatusList2021` tags.
const {match, nonMatch} = filterByTag({
  property: 'issuers',
  tags: ['RevocationList2020']
});

describe('StatusList2021 Credentials (Interop)', function() {
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Implementation';
  this.notImplemented = [...nonMatch.keys()];
  for(const [
    issuerName,
    {issuers, setStatusLists, publishStatusLists}
  ] of match) {
    let issuedVc;
    before(async function() {
      const issuer = issuers.find(issuer => issuer.tags.has('StatusList2021'));
      const {issuer: {id: issuerId}} = issuer;
      const credential = createValidVc({issuerId});
      const body = {credential};
      const {data} = await issuer.post({json: body});
      issuedVc = data;
    });
    for(const [verifierName, {verifiers}] of match) {
      const verifier = verifiers.find(verifier =>
        verifier.tags.has('StatusList2021'));
      it(`MUST successfully verify VC issued by ${issuerName}`,
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const body = createRequestBody({vc: issuedVc});
          const {result, error} = await verifier.post({json: body});
          should.exist(result);
          should.not.exist(error);
          // verifier returns 200
          result.status.should.equal(200);
          should.exist(result.data);
          // verifier responses vary but are all objects
          result.data.should.be.an('object');
          result.data.verified.should.equal(true);
          result.data.statusResult.verified.should.equal(true);
          result.data.checks.should.eql(['proof', 'credentialStatus']);
        });
      it(`MUST revoke a credential and fail to verify revoked credential`,
        async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          // copy vc issued
          const vc = klona(issuedVc);
          // get the status of the VC
          const statusInfo = await getCredentialStatus(
            {verifiableCredential: vc});
          statusInfo.status.should.equal(false);

          // verification of the credential should pass
          const {result: result1, error: err1} = await verifier.post(
            {json: createRequestBody({vc})});
          should.exist(result1);
          should.not.exist(err1);
          result1.status.should.equal(200);
          should.exist(result1.data);
          // verifier responses vary but are all objects
          result1.data.should.be.an('object');
          result1.data.verified.should.equal(true);
          const setStatusList = setStatusLists.find(
            issuer => issuer.tags.has('Revocation'));
          // Then revoke the VC
          const body = createRequestBody({
            vc, setStatus: true, statusPurpose: 'revocation'});
          const {
            result: result2,
            error: err2
          } = await setStatusList.post({json: body});
          should.not.exist(err2);
          should.exist(result2);
          result2.status.should.equal(200);
          const publishSlcEndpoint =
            `${statusInfo.statusListCredential}/publish`;
          const publishStatusList = publishStatusLists.find(issuer =>
            issuer.tags.has('Revocation'));
          // force publication of new SLC
          const {
            result: result3,
            error: err3
          } = await publishStatusList.post({url: publishSlcEndpoint, json: {}});
          should.not.exist(err3);
          should.exist(result3);
          result3.status.should.equal(204);

          // get the status of the VC
          const {status} = await getCredentialStatus(
            {verifiableCredential: vc});
          status.should.equal(true);

          // try to verify the credential again, should fail since it
          // has now been revoked
          const {
            result: result4,
            error: err4
          } = await verifier.post({json: createRequestBody({vc})});
          should.not.exist(result4);
          should.exist(err4);
          should.exist(err4.data);
          // verifier returns 400
          err4.status.should.equal(400);
          err4.data.verified.should.equal(false);
        });
    }
  }
});
