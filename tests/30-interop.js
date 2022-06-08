/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {createValidVc, createRequestBody, getCredentialStatus} from
  './helpers.js';
import {filterByTag} from 'vc-api-test-suite-implementations';
import {klona} from 'klona';
import {shouldPassVerification, shouldFailVerification} from './assertions.js';

const should = chai.should();

// only use implementations with `StatusList2021` tags.
const {match, nonMatch} = filterByTag({
  property: 'issuers',
  tags: ['StatusList2021']
});
describe('StatusList2021 Credentials (Interop "statusPurpose: revocation")',
  function() {
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
        const issuer = issuers.find(issuer => issuer.tags.has('Revocation'));
        const credential = createValidVc({issuer});
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
            const {result, error, statusCode} = await verifier.post(
              {json: body});
            shouldPassVerification({result, error, statusCode});
          });
        it('MUST update StatusList2021 revocation credential status and ' +
          'fail to verify revoked credential', async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          // copy vc issued
          const vc = klona(issuedVc);
          // get the status of the VC
          const statusInfo = await getCredentialStatus(
            {verifiableCredential: vc});
          statusInfo.status.should.equal(false);

          // verification of the credential should pass
          const {
            result: result1,
            error: err1,
            statusCode: statusCode1
          } = await verifier.post({json: createRequestBody({vc})});
          shouldPassVerification(
            {result: result1, error: err1, statusCode: statusCode1});

          const setStatusList = setStatusLists.find(
            issuer => issuer.tags.has('Revocation'));
          // Then revoke the VC
          const body = createRequestBody({
            vc, setStatus: true, statusPurpose: 'revocation'});
          const {
            result: result2,
            error: err2,
            statusCode: statusCode2
          } = await setStatusList.post({json: body});
          should.not.exist(err2);
          should.exist(result2);
          statusCode2.should.equal(200);
          const publishSlcEndpoint =
            `${statusInfo.statusListCredential}/publish`;
          const publishStatusList = publishStatusLists.find(
            issuer => issuer.tags.has('Revocation'));
          // force publication of new SLC
          const {
            result: result3,
            error: err3,
            statusCode: statusCode3
          } = await publishStatusList.post({url: publishSlcEndpoint, json: {}});
          should.not.exist(err3);
          should.exist(result3);
          statusCode3.should.equal(204);

          // get the status of the VC
          const {status} = await getCredentialStatus(
            {verifiableCredential: vc});
          status.should.equal(true);

          // try to verify the credential again, should fail since it
          // has now been revoked
          const {
            result: result4,
            error: err4,
            statusCode: statusCode4
          } = await verifier.post({json: createRequestBody({vc})});
          shouldFailVerification(
            {result: result4, error: err4, statusCode: statusCode4});
        });
      }
    }
  });

describe('StatusList2021 Credentials (Interop "statusPurpose: suspension")',
  function() {
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
        const issuer = issuers.find(issuer => issuer.tags.has('Suspension'));
        const credential = createValidVc({issuer});
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
            const {result, error, statusCode} = await verifier.post(
              {json: body});
            shouldPassVerification({result, error, statusCode});
          });
        it('MUST update StatusList2021 suspension credential status and ' +
          'fail to verify suspended credential', async function() {
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          // copy vc issued
          const vc = klona(issuedVc);
          // get the status of the VC
          const statusInfo = await getCredentialStatus(
            {verifiableCredential: vc});
          statusInfo.status.should.equal(false);

          // verification of the credential should pass
          const {
            result: result1,
            error: err1,
            statusCode: statusCode1
          } = await verifier.post({json: createRequestBody({vc})});
          shouldPassVerification(
            {result: result1, error: err1, statusCode: statusCode1});

          const setStatusList = setStatusLists.find(
            issuer => issuer.tags.has('Suspension'));
          // Then suspend the VC
          const body = createRequestBody({
            vc, setStatus: true, statusPurpose: 'suspension'});
          const {
            result: result2,
            error: err2,
            statusCode: statusCode2
          } = await setStatusList.post({json: body});
          should.not.exist(err2);
          should.exist(result2);
          statusCode2.should.equal(200);
          const publishSlcEndpoint =
            `${statusInfo.statusListCredential}/publish`;
          const publishStatusList = publishStatusLists.find(issuer =>
            issuer.tags.has('Suspension'));
            // force publication of new SLC
          const {
            result: result3,
            error: err3,
            statusCode: statusCode3
          } = await publishStatusList.post({url: publishSlcEndpoint, json: {}});
          should.not.exist(err3);
          should.exist(result3);
          statusCode3.should.equal(204);

          // get the status of the VC
          const {status} = await getCredentialStatus(
            {verifiableCredential: vc});
          status.should.equal(true);

          // try to verify the credential again, should fail since it
          // has now been revoked
          const {
            result: result4,
            error: err4,
            statusCode: statusCode4
          } = await verifier.post({json: createRequestBody({vc})});
          shouldFailVerification(
            {result: result4, error: err4, statusCode: statusCode4});
        });
      }
    }
  });
