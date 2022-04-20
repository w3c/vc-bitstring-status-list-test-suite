/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const {implementations} = require('vc-api-test-suite-implementations');
const {ISOTimeStamp, deepClone, getCredentialStatus} = require('./helpers');
const {JsonLdDocumentLoader} = require('jsonld-document-loader');
const rl = require('@digitalbazaar/vc-status-list');
const {testCredential} = require('./assertions');
const {v4: uuidv4} = require('uuid');
const {validVC} = require('../credentials');

const agent = new https.Agent({rejectUnauthorized: false});
const should = chai.should();

const handler = {
  async get({url}) {
    if(!url.startsWith('http')) {
      throw new Error('NotFoundError');
    }
    let result;
    try {
      result = await httpClient.get(url, {agent});
    } catch(e) {
      throw new Error('NotFoundError');
    }
    return result.data;
  }
};
const jdl = new JsonLdDocumentLoader();
jdl.setProtocolHandler({protocol: 'https', handler});

const documentLoader = jdl.build();

describe('StatusList2021 Credentials (interop)', function() {
  const summaries = new Set();
  this.summary = summaries;
  // column names for the matrix go here
  const columnNames = [];
  const reportData = [];
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.columns = columnNames;
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Vendor';
  // the reportData will be displayed under the test title
  this.reportData = reportData;
  for(const [name, implementation] of implementations) {
    describe(name, function() {
      let issuedVC;
      let err;
      let issuerResponse;
      // ensure this implementation is a column in the matrix
      columnNames.push(name);
      before(async function() {
        const issuer = implementation.issuers.find(issuer =>
          issuer.tags.has('StatusList2021'));
        const expires = () => {
          const date = new Date();
          date.setMonth(date.getMonth() + 2);
          return ISOTimeStamp({date});
        };
        const body = {
          credential: {
            ...validVC,
            id: `urn:uuid:${uuidv4()}`,
            issuanceDate: ISOTimeStamp(),
            expirationDate: expires(),
            issuer: issuer.id
          }
        };
        const {result, error} = await issuer.issue({body});
        issuerResponse = result;
        err = error;
        issuedVC = issuerResponse.data.verifiableCredential;
      });
      // ensure that issued VC contain correct properties.
      it(`MUST issue a VC with a "credentialStatus" property`,
        async function() {
          issuerResponse.status.should.equal(201);
          should.not.exist(err, `Expected ${name} to not error.`);
          this.test.cell = {columnId: name, rowId: this.test.title};
          should.exist(
            issuedVC, `Expected VC from ${name} to exist.`);
          // FIXME: issuer should return 201, some issuers like DB and
          // Transmute returns 200 instead
          testCredential(issuedVC);
          issuedVC.credentialSubject.should.eql(
            validVC.credentialSubject);
        });
      it('MUST have correct properties when dereferencing' +
            '"credentialStatus.statusListCredential"', async function() {
        this.test.cell = {columnId: name, rowId: this.test.title};
        // FIXME: Change revocationListCredential to statusListCredential
        const {credentialStatus: {revocationListCredential}} = issuedVC;
        const {document: rlc} = await documentLoader(revocationListCredential);
        rlc.should.have.property('type');
        // FIXME: Change the type to `StatusList2021Credential`.
        rlc.type.should.include('RevocationList2020Credential');
        rlc.should.have.property('credentialSubject');
        const {credentialSubject} = rlc;
        credentialSubject.should.have.keys(['id', 'type', 'encodedList']);
        // FIXME: Change type to equal 'RevocationList2021'
        credentialSubject.type.should.equal('RevocationList2020');
        const {encodedList} = credentialSubject;
        // Uncompress encodedList
        const decoded = await rl.decodeList({encodedList});
        should.exist(decoded);
        // decoded size should be 16kb
        const decodedSize = (decoded.length / 8) / 1024;
        decodedSize.should.equal(16);
      });
      // this sends a credential issued by the implementation
      // to each verifier
      for(const [name, implementation] of implementations) {
        it(`MUST successfully verify VC issued by all implementation`,
          async function() {
          // this tells the test report which cell in the interop matrix
          // the result goes in
            this.test.cell = {
              columnId: name,
              rowId: this.test.title
            };
            const verifier = implementation.verifiers.find(verifier =>
              verifier.tags.has('VC-HTTP-API'));
            const body = {
              verifiableCredential: issuedVC,
              options: {
                checks: ['proof', 'credentialStatus']
              }
            };
            const {result, error} = await verifier.verify({body});
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
            this.test.cell = {
              columnId: name,
              rowId: this.test.title
            };
            // copy vc issued
            const vc = deepClone(issuedVC);
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
            const verifier = implementation.verifiers.find(verifier =>
              verifier.tags.has('VC-HTTP-API'));
            const {result: result1, error: err1} = await verifier.verify(
              {body});
            should.exist(result1);
            should.not.exist(err1);
            result1.status.should.equal(200);
            should.exist(result1.data);
            // verifier responses vary but are all objects
            result1.data.should.be.an('object');
            result1.data.verified.should.equal(true);
            result1.data.statusResult.verified.should.equal(true);

            const issuer = implementation.issuers.find(issuer =>
              issuer.tags.has('StatusList2021'));
            const body2 = {
              credentialId: vc.id,
              credentialStatus: {
                type: 'RevocationList2020Status'
              }
            };
            // Then revoke the VC
            const {result: result2, error: err2} = await issuer.setStatus(
              {body: body2});
            should.not.exist(err2);
            should.exist(result2);
            result2.status.should.equal(200);
            const publishSlcEndpoint =
              `${statusInfo.statusListCredential}/publish`;
            console.log(publishSlcEndpoint, 'publishSlcEndpoint');
            // force publication of new SLC
            const {result: result3, error: err3} = issuer.publishSlc(
              {endpoint: publishSlcEndpoint, body: {}});
            console.log(result3, '<><><><>result3');
            should.not.exist(err3);
            should.exist(result3);
            result3.status.should.equal(200);

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
            const {result: result4, error: err4} = await verifier.verify(
              {body: body3});
            should.not.exist(result4);
            should.exist(err4);
            should.exist(err4.data);
            // verifier returns 400
            err4.status.should.equal(400);
            err4.data.verified.should.equal(false);
          });
      }
    });
  }
});
