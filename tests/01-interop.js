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
        //FIXME issuerResponse should be used to check status 201
        //let issuerResponse = null;
        let error = null;
        describe(issuer.name, function() {
          before(async function() {
            try {
              // ensure this implementation is a column in the matrix
              columnNames.push(issuer.name);
              const implementation = new Implementation(issuer);
              const response = await implementation.issue({credential});
              //FIXME issuerResponse should be used to check status 201
              //issuerResponse = response;
              // this credential is not tested
              // we just send it to each verifier
              issuedVC = unwrapResponse(response.data);
            } catch(e) {
              console.error(`${issuer.name} failed to issue a ` +
                'credential for verification tests', e);
              error = e;
            }
          });
          // this ensures the implementation issuer
          // issues correctly
          it(`should be issued by ${issuer.name}`, async function() {
            should.exist(
              credential, `Expected VC from ${issuer.name} to exist.`);
            should.not.exist(error, `Expected ${issuer.name} to not error.`);

            // FIXME issuer should return 201
            //issuerResponse.status.should.equal(201);

            testCredential(issuedVC);
            issuedVC.credentialSubject.should.eql(
              credential.credentialSubject);
          });
          // this sends a credential issued by the implementation
          // to each verifier
          for(const verifier of testAPIs) {
            it(`should be verified by ${verifier.name}`, async function() {
              // this tells the test report which cell
              // in the interop matrix the result goes in
              this.test.cell = {columnId: verifier.name, rowId: issuer.name};
              should.exist(credential);
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
