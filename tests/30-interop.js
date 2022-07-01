/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const {filterByTag} = require('vc-api-test-suite-implementations');
const {ISOTimeStamp, getCredentialStatus} = require('./helpers.js');
const {klona} = require('klona');
const {v4: uuidv4} = require('uuid');
const {validVc} = require('../credentials');

const should = chai.should();

// only use implementations with `StatusList2021` tags.
const {match, nonMatch} = filterByTag({
  property: 'issuers',
  tags: ['RevocationList2020']
});

describe('StatusList2021 Credentials (Interop)', function() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Implementation';
  this.notImplemented = [...nonMatch.keys()];
  // the reportData will be displayed under the test title
  for(const [issuerName, {issuers, statusLists, publishStatusLists}] of match) {
    let issuedVc;
    before(async function() {
      const issuer = issuers.find(issuer =>
        issuer.tags.has('RevocationList2020'));
      const expires = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2);
        return ISOTimeStamp({date});
      };
      const {issuer: {id: issuerId}} = issuer;
      const body = {
        credential: {
          ...validVc,
          id: `urn:uuid:${uuidv4()}`,
          issuanceDate: ISOTimeStamp(),
          expirationDate: expires(),
          issuer: issuerId
        }
      };
      const {result} = await issuer.issue({body});
      if(result) {
        issuedVc = result.data.verifiableCredential;
      }
    });
    // this sends a credential issued by the implementation
    // to each verifier
    for(const [verifierName, {verifiers}] of match) {
      const verifier = verifiers.find(verifier =>
        verifier.tags.has('StatusList2021'));
      it(`MUST successfully verify VC issued by ${issuerName}`,
        async function() {
          // this tells the test report which cell in the interop matrix
          // the result goes in
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const body = {
            verifiableCredential: issuedVc,
            options: {
              checks: ['proof', 'credentialStatus']
            }
          };
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
          // FIXME: Currently this test uses credential with 2020 status
          // type.

          // this tells the test report which cell in the interop matrix
          // the result goes in
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          // copy vc issued
          const vc = klona(issuedVc);
          // get the status of the VC
          const statusInfo = await getCredentialStatus(
            {verifiableCredential: vc});
          statusInfo.status.should.equal(false);

          // verification of the credential should pass
          const body = {
            verifiableCredential: vc,
            options: {
              checks: ['proof', 'credentialStatus']
            }
          };
          const {result: result1, error: err1} = await verifier.post(
            {json: body});
          should.exist(result1);
          should.not.exist(err1);
          result1.status.should.equal(200);
          should.exist(result1.data);
          // verifier responses vary but are all objects
          result1.data.should.be.an('object');
          result1.data.verified.should.equal(true);
          result1.data.statusResult.verified.should.equal(true);

          const statusList = statusLists.find(issuer =>
            issuer.tags.has('RevocationList2020'));
          const publishList = publishStatusLists.find(issuer =>
            issuer.tags.has('RevocationList2020'));
          const body2 = {
            credentialId: vc.id,
            credentialStatus: {
              type: 'RevocationList2020Status'
            }
          };
            // Then revoke the VC
          const {result: result2, error: err2} = await statusList.post(
            {json: body2});
          should.not.exist(err2);
          should.exist(result2);
          result2.status.should.equal(200);
          const publishSlcEndpoint =
              `${statusInfo.statusListCredential}/publish`;
            // force publication of new SLC
          const {result: result3, error: err3} = await publishList.post(
            {url: publishSlcEndpoint, json: {}});
          should.not.exist(err3);
          should.exist(result3);
          result3.status.should.equal(204);

          // get the status of the VC
          const {status} = await getCredentialStatus(
            {verifiableCredential: vc});
          status.should.equal(true);

          // try to verify the credential again, should fail since it
          // has been revoked
          const body3 = {
            verifiableCredential: vc,
            options: {
              checks: ['proof', 'credentialStatus']
            }
          };
          const {result: result4, error: err4} = await verifier.post(
            {json: body3});
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
