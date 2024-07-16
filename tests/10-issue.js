/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as sl from '@digitalbazaar/vc-status-list';
import chai, {assert} from 'chai';
import {getSlc, issueVc} from './helpers.js';
import {testCredential, testSlCredential} from './assertions.js';
import {filterByTag} from 'vc-test-suite-implementations';

const should = chai.should();

// only use implementations with `BitstringStatusList` issuers.
const {match} = filterByTag({
  property: 'issuers',
  tags: ['BitstringStatusList']
});
describe('Issuers - BitstringStatusList',
  function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Issuer';
    for(const [issuerName, {issuers}] of match) {
      describe(issuerName, function() {
        let issuerResponse;
        let err;
        let issuedVc;
        beforeEach(function() {
          this.test.cell = {
            columnId: issuerName, rowId: this.test.title
          };
        });
        before(async function() {
          const issuer = issuers.find(
            issuer => issuer.tags.has('BitstringStatusList'));
          const {result, error, data} = await issueVc({issuer});
          err = error;
          issuerResponse = result;
          issuedVc = data;
          const credentialStatusType = typeof (issuedVc.credentialStatus);
          if(credentialStatusType === 'object') {
            // TODO make everything an array and test each status entry
            // issuedVc.credentialStatus = [issuedVc.credentialStatus]
          }
        });
        describe('BitstringStatusList Entry', function() {
          it('Any expression of the data model in this section \
            MUST be expressed in a conforming verifiable credential \
            as defined in [VC-DATA-MODEL-2.0].',
          async function() {
            should.exist(issuerResponse);
            should.not.exist(err);
            issuerResponse.status.should.equal(201);
            should.exist(issuedVc, `Expected VC from ${issuerName} to exist.`);
            testCredential({credential: issuedVc});
          });
          it('If present, the id value is expected to be a URL \
            that identifi the status information associated \
            with the verifiable credential. \
            It MUST NOT be the URL for the status list.',
          async function() {
            if(!!issuedVc.credentialStatus.id) {
              // TODO test for URI
              issuedVc.credentialStatus.id.should.be.a('string');
            } else {
              this.skip();
            }
          });
          it('The type property MUST be BitstringStatusListEntry. ',
            async function() {
              issuedVc.credentialStatus.should.contain.keys('type');
              // we are evaluating the type of the type property
              const credentialStatusTypeType = typeof (
                issuedVc.credentialStatus.type);
              credentialStatusTypeType.should.be.oneOf(['string', 'array']);
              if(credentialStatusTypeType === 'string') {
                issuedVc.credentialStatus.type = [
                  issuedVc.credentialStatus.type];
              }
              issuedVc.credentialStatus.type.should.include.members([
                'BitstringStatusListEntry'
              ]);
            });
          it('The purpose of the status entry MUST be a string.',
            async function() {
              issuedVc.credentialStatus.should.contain.keys('statusPurpose');
              issuedVc.credentialStatus.statusPurpose.should.be.a('string');
            });
          it('The statusListIndex property MUST be an arbitrary size integer \
            greater than or equal to 0, expressed as a string in base 10.',
          async function() {
            issuedVc.credentialStatus.should.contain.keys('statusListIndex');
            issuedVc.credentialStatus.statusListIndex.should.be.a('number');
            issuedVc.credentialStatus.statusListIndex.should.be.gte(0);
            //   TODO check for base 10
          });
          it('The statusListCredential property MUST be a URL to a \
            verifiable credential.',
          async function() {
            issuedVc.credentialStatus.should.contain.keys(
              'statusListCredential');
            issuedVc.credentialStatus.statusListCredential.should.be.a(
              'string');
            const {slc} = await getSlc({issuedVc});
            console.log(slc);
            // const statusListCredential = (await getSlc({ issuedVc })).slc;
            // testSlCredential({slCredential: statusListCredential});
          });
          it('statusSize MAY be provided.',
            // Note that this feature (statusSize) is currently at RISK
            async function() {
              if(!!issuedVc.credentialStatus.statusSize) {
                it(' If present, \
                  statusSize MUST be an integer greater than zero.',
                async function() {
                  issuedVc.credentialStatus.statusSize.should.be.a('number');
                  // TODO test for integer
                  assert(Number.isInteger(
                    issuedVc.credentialStatus.statusSize));
                  issuedVc.credentialStatus.statusSize.should.be.gt(0);
                });
                if(issuedVc.credentialStatus.statusSize.gt(1)) {
                  it(' If statusSize is provided and is greater than 1, \
                  then the property credentialStatus.statusMessage \
                  MUST be present',
                  async function() {
                    issuedVc.credentialStatus.should.contain.keys(
                      'statusMessage');
                  });
                }
                it('the number of status messages MUST equal the number \
                  of possible values.',
                async function() {
                  this.test.cell = {
                    columnId: issuerName, rowId: this.test.title};
                  issuedVc.credentialStatus.statusSize.should.be.an('array');
                  issuedVc.credentialStatus.statusSize.length.should.be.equal(
                    issuedVc.credentialStatus.statusSize);
                });
                it('If present, the statusMessage property MUST be an array, \
                  the length of which MUST equal the number of possible status \
                  messages indicated by statusSize',
                async function() {
                  this.test.cell = {
                    columnId: issuerName, rowId: this.test.title};
                  issuedVc.credentialStatus.statusSize.should.be.an('array');
                  issuedVc.credentialStatus.statusSize.length.should.be.equal(
                    issuedVc.credentialStatus.statusSize);
                });
                if(issuedVc.credentialStatus.statusSize.gt(1)) {
                  it('statusMessage MAY be present if statusSize is 1, \
                  and MUST be present if statusSize is greater than 1.',
                  async function() {
                    issuedVc.credentialStatus.should.contain.keys(
                      'statusMessage');
                  });
                }
                it('If the statusMessage array is present, \
                  each element MUST contain the two properties described below',
                async function() {
                  // TODO this needs more testing:
                  // a string representing the hexadecimal
                  // value of the status prefixed with 0x
                  const statusMessage = issuedVc.credentialStatus.statusMessage;
                  statusMessage.should.each.have.property(
                    'status').that.is.a('string');
                  statusMessage.should.each.have.property(
                    'message').that.is.a('string');
                });
              } else {
                this.skip();
              }
            });
          it('An implementer MAY include the statusReference property.',
            async function() {
              if(!!issuedVc.credentialStatus.statusReference) {
                it('If present, its value MUST be a URL or an array of URLs \
                    [URL] which dereference to material related to the status.',
                async function() {
                  const statusReferenceType = typeof (
                    issuedVc.credentialStatus.statusReference);
                  statusReferenceType.should.be.oneOf(['string', 'array']);
                  // TODO test for URLS
                });
              } else {
                this.skip();
              }
            });
        });
        describe('BitstringStatusList Credential', function() {
          let statusListCredential;
          before(async function() {
            statusListCredential = (await getSlc({issuedVc})).slc;
          });
          it('When a status list verifiable credential is published, \
            it MUST be a conforming document, \
            as defined in [VC-DATA-MODEL-2.0].',
          async function() {
            testSlCredential({slCredential: statusListCredential});
          });
          it('The verifiable credential that contains the status list \
            MUST express a type property that includes the \
            BitstringStatusListCredential value.',
          async function() {
            statusListCredential.should.contain.keys('type');
            statusListCredential.type.should.include.members([
              'BitstringStatusListCredential'
            ]);
          }
          );
          it('The type of the credential subject, which is the status list, \
            MUST be BitstringStatusList.',
          async function() {
            statusListCredential.credentialSubject.should.contain.keys('type');
            const credentialSubjectType = typeof (
              statusListCredential.credentialSubject.type);
            credentialSubjectType.should.be.oneOf(['string', 'array']);
            if(credentialSubjectType === 'string') {
              statusListCredential.credentialSubject.type = [
                statusListCredential.credentialSubject.type];
            }
            statusListCredential.credentialSubject.type.should.include.members([
              'BitstringStatusList'
            ]);
          });
          it('The value of the purpose property of the status entry, \
            statusPurpose, MUST be one or more strings.',
          async function() {
            const statusPurposeType = typeof (
              statusListCredential.credentialSubject.statusPurpose);
            statusPurposeType.should.be.oneOf(['string', 'object']);
            if(statusPurposeType === ('object')) {
              const credentialSubject = statusListCredential.credentialSubject;
              credentialSubject.statusPurpose.should.be.an(
                'array');
              credentialSubject.statusPurpose.forEach(
                item => chai.assert.isString(item));
            }
          }
          );
          it('The encodedList property of the credential subject MUST \
            be a Multibase-encoded base64url (with no padding) [RFC4648] \
            representation of the GZIP-compressed [RFC1952] bitstring values \
            for the associated range of verifiable credential status values.',
          async function() {
            const {slc: {credentialSubject}} = await getSlc({issuedVc});
            const {encodedList} = credentialSubject;
            // Uncompress encodedList
            const decoded = await sl.decodeList({encodedList});
            should.exist(decoded);
          }
          );
          it('The uncompressed bitstring MUST be at least 16KB in size.',
            async function() {
              const {slc: {credentialSubject}} = await getSlc({issuedVc});
              const {encodedList} = credentialSubject;
              // Uncompress encodedList
              const decoded = await sl.decodeList({encodedList});
              should.exist(decoded);
              // decoded size should be 16kb
              const decodedSize = (decoded.length / 8) / 1024;
              decodedSize.should.be.gte(16);
            }
          );
          it('The bitstring MUST be encoded such that the first index, \
            with a value of zero (0), is located at the left-most bit \
            in the bitstring and the last index, with a value of \
            one less than the length of the bitstring (bitstring_length - 1), \
            is located at the right-most bit in the bitstring.',
          async function() {
            const {slc: {credentialSubject}} = await getSlc({issuedVc});
            const {encodedList} = credentialSubject;
            const decoded = await sl.decodeList({encodedList});
            decoded.bitstring.bits[0].should.be.equal(0);
            decoded.bitstring.bits[
              decoded.bitstring.bits.length - 1].should.be.equal(0);
          }
          );
        });
      });
    }
  });
