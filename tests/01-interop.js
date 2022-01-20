/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const Implementation = require('./Implementation');
const credentials = require('../credentials');
const {testCredential} = require('./assertions');
const implementations = require('../implementations');
const {unwrapResponse} = require('./helpers');

const should = chai.should();
// test these implementations' issuers or verifiers
const test = [
  'Digital Bazaar'
];

// only test listed implementations
const testAPIs = implementations.filter(v => test.includes(v.name));

describe('Template Credentials Test', function() {
  const summaries = new Set();
  this.summary = summaries;
  for(const credential of credentials) {
    const {credentialSubject: {id}} = credential;
    describe(`VC ${id}`, function() {
      // column names for the matrix go here
      const columnNames = [];
      const reportData = [];
      const images = [];
      // this will tell the report
      // to make an interop matrix with this suite
      this.matrix = true;
      this.report = true;
      this.columns = columnNames;
      this.rowLabel = 'Issuer';
      this.columnLabel = 'Verfier';
      // the reportData will be displayed under the test title
      this.reportData = reportData;
      this.images = images;

      after(async function() {
        reportData.push({
          label: 'Extra Report Data',
          data: JSON.stringify({extra: true}, null, 2)
        });
      });
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
          it(`should be issued by ${issuer.name}`, async function() {
            should.exist(
              credential, `Expected VC from ${issuer.name} to exist.`);
            should.not.exist(error, `Expected ${issuer.name} to not error.`);
            // FIXME issuer should return 201, some issuers like DB and
            // Transmute returns 200 instead
            // issuerResponse.status.should.equal(201);

            testCredential(issuedVC);
            issuedVC.credentialSubject.should.eql(
              credential.credentialSubject);
          });
          // this sends a credential issued by the implementation
          // to each verifier
          for(const verifier of testAPIs) {
            it(`should be verified by ${verifier.name}`, async function() {
              // this tells the test report which cell in the interop matrix
              // the result goes in
              this.test.cell = {columnId: verifier.name, rowId: issuer.name};
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
            });
            it(`should fail verification if "credentialStatus.id" is invalid`,
              async function() {
                // this tells the test report which cell
                // in the interop matrix the result goes in
                this.test.cell = {columnId: verifier.name, rowId: issuer.name};
                const copyIssuedVC = {...issuedVC};
                // intentionally change credentialStatus id to an invalid id
                copyIssuedVC.credentialStatus.id = 'invalid';
                const implementation = new Implementation(verifier);
                let response;
                let err;
                try {
                  response = await implementation.verify({
                    credential: copyIssuedVC
                  });
                } catch(e) {
                  err = e;
                }
                should.not.exist(response);
                should.exist(err);
                // verifier returns 400
                err.status.should.equal(400);
              });
          }
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
