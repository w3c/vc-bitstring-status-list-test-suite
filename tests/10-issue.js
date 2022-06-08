/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {createValidVc, getSlc} from './helpers.js';
import {filterByTag} from 'vc-api-test-suite-implementations';
import * as sl from '@digitalbazaar/vc-status-list';
import {testCredential, testSlCredential} from './assertions.js';

const should = chai.should();

// only use implementations with `StatusList2021` issuers.
const {match, nonMatch} = filterByTag({
  property: 'issuers',
  tags: ['StatusList2021']
});
describe('StatusList2021 Credentials (Issue "statusPurpose: revocation")',
  function() {
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
          const issuer = issuers.find(issuer => issuer.tags.has('Revocation'));
          const credential = createValidVc({issuer});
          const {result, error, data} = await issuer.post({
            json: {credential}});
          err = error;
          issuerResponse = result;
          issuedVc = data;
        });
        it('MUST issue a VC with SL 2021 "credentialStatus" and ' +
          '"revocation" status purpose', async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          should.exist(issuerResponse);
          should.not.exist(err);
          issuerResponse.status.should.equal(201);
          should.exist(issuedVc, `Expected VC from ${issuerName} to exist.`);
          testCredential({credential: issuedVc});
        });
        // ensure that issued StatusList Credential contain correct properties
        it('MUST have correct properties when dereferencing' +
          '"credentialStatus.statusListCredential"', async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          const {slc} = await getSlc({issuedVc});
          testSlCredential({slCredential: slc});
        });
        it('MUST be 16kb in size when "encodedList" is decoded',
          async function() {
            this.test.cell = {columnId: issuerName, rowId: this.test.title};
            const {slc: {credentialSubject}} = await getSlc({issuedVc});
            const {encodedList} = credentialSubject;
            // Uncompress encodedList
            const decoded = await sl.decodeList({encodedList});
            should.exist(decoded);
            // decoded size should be 16kb
            const decodedSize = (decoded.length / 8) / 1024;
            decodedSize.should.equal(16);
          });
      });
    }
  });

describe('StatusList2021 Credentials (Issue "statusPurpose: suspension")',
  function() {
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
          const issuer = issuers.find(issuer => issuer.tags.has('Suspension'));
          const credential = createValidVc({issuer});
          const {result, error, data} = await issuer.post({
            json: {credential}});
          err = error;
          issuerResponse = result;
          issuedVc = data;
        });
        it('MUST issue a VC with SL 2021 "credentialStatus" and ' +
          '"suspension" status purpose', async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          should.exist(issuerResponse);
          should.not.exist(err);
          issuerResponse.status.should.equal(201);
          should.exist(issuedVc, `Expected VC from ${issuerName} to exist.`);
          testCredential({credential: issuedVc});
        });
        // ensure that issued StatusList Credential contain correct properties
        it('MUST have correct properties when dereferencing' +
          '"credentialStatus.statusListCredential"', async function() {
          this.test.cell = {columnId: issuerName, rowId: this.test.title};
          const {slc} = await getSlc({issuedVc});
          testSlCredential({slCredential: slc});
        });
        it('MUST be 16kb in size when "encodedList" is decoded',
          async function() {
            this.test.cell = {columnId: issuerName, rowId: this.test.title};
            const {slc: {credentialSubject}} = await getSlc({issuedVc});
            const {encodedList} = credentialSubject;
            // Uncompress encodedList
            const decoded = await sl.decodeList({encodedList});
            should.exist(decoded);
            // decoded size should be 16kb
            const decodedSize = (decoded.length / 8) / 1024;
            decodedSize.should.equal(16);
          });
      });
    }
  });
