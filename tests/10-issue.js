/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const documentLoader = require('../vc-generator/documentLoader.js');
const {filterByTag} = require('vc-api-test-suite-implementations');
const {ISOTimeStamp} = require('./helpers.js');
const rl = require('@digitalbazaar/vc-status-list');
const {testCredential} = require('./assertions.js');
const {v4: uuidv4} = require('uuid');
const {validVc} = require('../credentials');

const should = chai.should();

// only use implementations with `StatusList2021` issuers.
const {match, nonMatch} = filterByTag({issuerTags: ['RevocationList2020']});

describe('StatusList2021 Credentials (Issue)', function() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Issuer';
  this.notImplemented = [...nonMatch.keys()];
  for(const [issuerName, {issuers}] of match) {
    describe(issuerName, function() {
      let issuerResponse;
      let err;
      let issuedVc;
      before(async function() {
        const issuer = issuers.find(
          issuer => issuer.tags.has('RevocationList2020'));
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
        const {result, error} = await issuer.issue({body});
        issuerResponse = result;
        err = error;
        if(issuerResponse) {
          // FIXME: This might need to be changed to `result.data` instead
          issuedVc = issuerResponse.data.verifiableCredential;
        }
      });
      it(`MUST issue a VC with a "credentialStatus" property`,
        async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          should.not.exist(err, `Expected ${issuerName} to not error.`);
          should.exist(issuerResponse);
          issuerResponse.status.should.equal(201);
          should.exist(
            issuedVc, `Expected VC from ${issuerName} to exist.`);
          testCredential(issuedVc);
          issuedVc.credentialSubject.should.eql(
            validVc.credentialSubject);
        });
      // ensure that issued VC contain correct properties.
      it('MUST have correct properties when dereferencing' +
      '"credentialStatus.statusListCredential"', async function() {
        this.test.cell = {columnId: issuerName, rowId: this.test.title};
        // FIXME: Change revocationListCredential to statusListCredential
        const {credentialStatus: {revocationListCredential}} = issuedVc;
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
    });
  }
});
