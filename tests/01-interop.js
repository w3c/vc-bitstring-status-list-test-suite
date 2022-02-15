/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const Implementation = require('./Implementation');
const credentials = require('../credentials');
const {JsonLdDocumentLoader} = require('jsonld-document-loader');
const {testCredential} = require('./assertions');
const implementations = require('../implementations');
const {unwrapResponse} = require('./helpers');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const agent = new https.Agent({rejectUnauthorized: false});
const rl = require('vc-status-list');
const invalidCredentialStatusType =
  require('../static-vcs/invalidCredentialStatusType.json');
const invalidStatusListCredentialId =
  require('../static-vcs/invalidStatusListCredentialId.json');
const validVC = require('../static-vcs/validVC.json');

const should = chai.should();
// test these implementations' issuers or verifiers
const test = [
  'Digital Bazaar'
];
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

// only test listed implementations
const testAPIs = implementations.filter(v => test.includes(v.name));

describe('StatusList2021 Credentials Test', function() {
  const summaries = new Set();
  this.summary = summaries;
  for(const credential of credentials) {
    describe('StatusList2021 Credentials Test', function() {
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
      for(const issuer of testAPIs) {
        // this is the credential for the verifier tests
        let issuedVC = null;
        let issuerResponse = null;
        let error = null;
        describe(issuer.name, function() {
          before(async function() {
            try {
              // ensure this implementation is a column in the matrix
              columnNames.push(issuer.name);
              const implementation = new Implementation(issuer);
              issuerResponse = await implementation.issue({credential});
              issuedVC = unwrapResponse(issuerResponse.data);
            } catch(e) {
              console.error(`${issuer.name} failed to issue a ` +
                'credential for verification tests', e);
              error = e;
            }
          });
          // this ensures the implementation issuer
          // issues correctly and the issuedVC properties are correct
          it(`MUST issue a VC with a "credentialStatus" property`,
            async function() {
              this.test.cell = {columnId: issuer.name, rowId: this.test.title};
              should.exist(
                credential, `Expected VC from ${issuer.name} to exist.`);
              should.not.exist(error, `Expected ${issuer.name} to not error.`);
              // FIXME: issuer should return 201, some issuers like DB and
              // Transmute returns 200 instead
              // issuerResponse.status.should.equal(201);
              testCredential(issuedVC);
              issuedVC.credentialSubject.should.eql(
                credential.credentialSubject);
            });
          it('MUST have correct properties when dereferencing' +
            '"credentialStatus.statusListCredential"', async function() {
            this.test.cell = {columnId: issuer.name, rowId: this.test.title};
            // FIXME: Change revocationListCredential to statusListCredential
            const {credentialStatus: {revocationListCredential}} = issuedVC;
            const {document: rlc} =
              await documentLoader(revocationListCredential);
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
          for(const verifier of testAPIs) {
            it(`MUST successfully verify VC issued by all implementation`,
              async function() {
              // this tells the test report which cell in the interop matrix
              // the result goes in
                this.test.cell = {
                  columnId: verifier.name,
                  rowId: this.test.title
                };
                const implementation = new Implementation(verifier);
                const response = await implementation.verify({
                  credential: issuedVC
                });
                should.exist(response);
                // verifier returns 200
                response.status.should.equal(200);
                should.exist(response.data);
                // verifier responses vary but are all objects
                response.data.should.be.an('object');
                response.data.verified.should.equal(true);
                response.data.statusResult.verified.should.equal(true);
                response.data.checks.should.eql(['proof', 'credentialStatus']);
              });
          }

        });
      }
      for(const verifier of testAPIs) {
        describe(verifier.name, function() {
          it.skip('MUST verify a valid "StatusList2021Credential"',
            async function() {
            // this tells the test report which cell
            // in the interop matrix the result goes in
              this.test.cell = {
                columnId: verifier.name,
                rowId: this.test.title
              };
              const implementation = new Implementation(verifier);
              let response;
              let err;
              try {
                response = await implementation.verify({
                  credential: validVC
                });
              } catch(e) {
                err = e;
              }
              should.exist(response);
              should.not.exist(err);
            });
          it('MUST fail to verify a VC with invalid ' +
          '"credentialStatus.statusListCredential"', async function() {
          // this tells the test report which cell
          // in the interop matrix the result goes in
            this.test.cell = {
              columnId: verifier.name,
              rowId: this.test.title
            };
            const implementation = new Implementation(verifier);
            let response;
            let err;
            try {
              response = await implementation.verify({
                credential: invalidStatusListCredentialId
              });
            } catch(e) {
              err = e;
            }
            should.not.exist(response);
            should.exist(err);
            should.exist(err.data);
            // verifier returns 400
            err.status.should.equal(400);
            err.data.verified.should.equal(false);
            const {check} = err.data.checks[0];
            check.should.be.an('array');
            check.should.include.members(['credentialStatus', 'proof']);
          });
          it('MUST fail to verify a VC with invalid "credentialStatus.type"',
            async function() {
            // this tells the test report which cell
            // in the interop matrix the result goes in
              this.test.cell = {
                columnId: verifier.name,
                rowId: this.test.title
              };
              const implementation = new Implementation(verifier);
              let response;
              let err;
              try {
                response = await implementation.verify({
                  credential: invalidCredentialStatusType
                });
              } catch(e) {
                err = e;
              }
              should.not.exist(response);
              should.exist(err);
              should.exist(err.data);
              // verifier returns 400
              err.status.should.equal(400);
              err.data.verified.should.equal(false);
            });
        });
      }
    });
  }
  after(function() {
    // add summary of certificates and implementations used
    summaries.add(
      'This suite issued & verified credentials for' +
         ` ${credentials.length} vcs`);
    summaries.add(`These vcs were issued & verified by` +
        ` ${testAPIs.length} implementations.`);
  });
});
