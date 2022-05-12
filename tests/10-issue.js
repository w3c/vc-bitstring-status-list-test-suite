/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const documentLoader = require('../vc-generator/documentLoader.js');
const {filterByTag} = require('vc-api-test-suite-implementations');
const {ISOTimeStamp} = require('./helpers.js');
const sl = require('@digitalbazaar/vc-status-list');
const {testCredential, testSlCredential} = require('./assertions.js');
const {v4: uuidv4} = require('uuid');
const {validVc} = require('../credentials');

const should = chai.should();

// only use implementations with `StatusList2021` issuers.
const {match, nonMatch} = filterByTag({
  property: 'issuers',
  tags: ['RevocationList2020']
});

describe.only('StatusList2021 Credentials (Issue)', function() {
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
        const {settings: {id: issuerId}} = issuer;
        const body = {
          credential: {
            ...validVc,
            id: `urn:uuid:${uuidv4()}`,
            issuanceDate: ISOTimeStamp(),
            expirationDate: expires(),
            issuer: issuerId
          }
        };
        const {result, error, data} = await issuer.post({json: body});
        issuerResponse = result;
        err = error;
        issuerResponse = result;
        issuedVc = data;
      });
      it('MUST issue a VC with a "credentialStatus" property and ' +
        '"credentialStatus.type" StatusList2021Entry', async function() {
        this.test.cell = {columnId: issuerName, rowId: this.test.title};
        should.exist(issuerResponse);
        should.not.exist(err);
        issuerResponse.status.should.equal(201);
        should.exist(
          issuedVc, `Expected VC from ${issuerName} to exist.`);
        testCredential({credential: issuedVc});
        issuedVc.credentialSubject.should.eql(validVc.credentialSubject);
      });
      describe('Check SLC Properties', function() {
        let slc;
        before(async function() {
          const {credentialStatus: {statusListCredential}} = issuedVc;
          const {document} = await documentLoader(statusListCredential);
          slc = document;
        });
        // ensure that issued StatusList Credential contain correct properties
        it('MUST have correct properties when dereferencing' +
          '"credentialStatus.statusListCredential"', async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          testSlCredential({slCredential: slc});
        });
        it('Size of decoded "encodedList" MUST be 16kb', async function() {
          const {credentialSubject} = slc;
          const {encodedList} = credentialSubject;
          // Uncompress encodedList
          const decoded = await sl.decodeList({encodedList});
          should.exist(decoded);
          // decoded size should be 16kb
          const decodedSize = (decoded.length / 8) / 1024;
          decodedSize.should.equal(16);
        });
      });
    });
  }
});
