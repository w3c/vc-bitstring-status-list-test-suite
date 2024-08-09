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
        let statusEntry;
        let issuedVc;
        let statusEntries;
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
          if(issuedVc.hasOwnProperty('credentialStatus')) {
            if(Array.isArray(issuedVc.credentialStatus)) {
              statusEntries = issuedVc.credentialStatus;
            } else {
              statusEntries = [issuedVc.credentialStatus];
            }
          }
        });
        describe('BitstringStatusList Entry', function() {
          it('Any expression of the data model in this section ' +
            'MUST be expressed in a conforming verifiable credential ' +
            'as defined in [VC-DATA-MODEL-2.0].',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=Any%20expression%20of%20the%20data%20model%20in%20this%20section%20MUST%20be%20expressed%20in%20a%20conforming%20verifiable%20credential%20as%20defined%20in%20%5BVC%2DDATA%2DMODEL%2D2.0%5D.';
            should.exist(issuerResponse,
              'Expected an issuer response.');
            should.not.exist(err,
              'Expected no errors in the issuer response.');
            issuerResponse.status.should.equal(201,
              'Expected response http code 201.');
            should.exist(issuedVc, `Expected VC from ${issuerName} to exist.`);
            testCredential({credential: issuedVc});
          });
          it('If present, the id value is expected to be a URL ' +
            'that identifies the status information associated ' +
            'with the verifiable credential. ' +
            'It MUST NOT be the URL for the status list.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20present%2C%20the%20value%20is%20expected%20to%20be%20a%20URL%20that%20identifies%20the%20status%20information%20associated%20with%20the%20verifiable%20credential.';
            for(statusEntry in statusEntries) {
              if(!!statusEntries[statusEntry].id) {
                // TODO test for URI
                statusEntries[statusEntry].id.should.be.a('string',
                  'Expected credentialStatus.id to be a string.'
                );
              } else {
                this.skip();
              }
            }
          });
          it('The type property MUST be BitstringStatusListEntry. ',
            async function() {
              this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20type%20property%20MUST%20be%20BitstringStatusListEntry.';
              for(statusEntry in statusEntries) {
                statusEntries[statusEntry].should.have.own.property(
                  'type').to.be.a('string',
                  'Expected credentialStatus.type to be a string.'
                );
                statusEntries[statusEntry].type.should.equal(
                  'BitstringStatusListEntry',
                  'Expected credentialStatus.type to be ' +
                  'BitstringStatusListEntry.'
                );
              }
            });
          it('The purpose of the status entry MUST be a string.',
            async function() {
              this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20purpose%20of%20the%20status%20entry%20MUST%20be%20a%20string';
              for(statusEntry in statusEntries) {
                statusEntries[statusEntry].should.have.own.property(
                  'statusPurpose').to.be.a('string',
                  'Expected credentialStatus.statusPurpose to be a string.'
                );
              }
            });
          it('The statusListIndex property MUST be an arbitrary size integer ' +
            'greater than or equal to 0, expressed as a string in base 10.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20statusListIndex%20property%20MUST%20be%20an%20arbitrary%20size%20integer%20greater%20than%20or%20equal%20to%200%2C%20expressed%20as%20a%20string%20in%20base%2010';
            for(statusEntry in statusEntries) {
              statusEntries[statusEntry].should.have.own.property(
                'statusListIndex').to.be.a('string',
                'Expected statusListIndex to be a string.'
              );
              assert(
                String(parseInt(statusEntries[statusEntry].statusListIndex)) ===
                statusEntries[statusEntry].statusListIndex,
                'Expected statusSize value to be an integer ' +
                'expressed as a string in base 10.'
              );
              parseInt(statusEntries[statusEntry].statusListIndex).
                should.be.gte(0,
                  'Expected credentialStatus.statusListIndex to be >= 0.');
            }
          });
          it('The statusListCredential property MUST be a URL to a ' +
            'verifiable credential.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20statusListCredential%20property%20MUST%20be%20a%20URL%20to%20a%20verifiable%20credential.';
            // TODO check for URI
            for(statusEntry in statusEntries) {
              statusEntries[statusEntry].should.have.own.
                property('statusListCredential').to.be.
                a('string',
                  'Expected credentialStatus.statusListCredential to be a URL.'
                );
              const {slc} = await getSlc(statusEntries[statusEntry]);
              console.log(statusEntries[statusEntry]);
              should.exist(slc,
                'Expected statusListCredential to resolve to a ' +
                'Verifiable Credential');
              testSlCredential({slCredential: slc});
            }
          });
          it('When the URL is dereferenced, the resulting verifiable ' +
            'credential MUST have type property that includes the ' +
            'BitstringStatusListCredential value.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=When%20the%20URL%20is%20dereferenced%2C%20the%20resulting%20verifiable%20credential%20MUST%20have%20type%20property%20that%20includes%20the%20BitstringStatusListCredential%20value.';
            for(statusEntry in statusEntries) {
              const {slc} = await getSlc(statusEntries[statusEntry]);
              slc.should.have.own.
                property('type').to.be.
                an('array',
                  'Expected type to be an array.'
                );
              slc.type.should.include(
                'BitstringStatusListCredential',
                'Expected type to be BitstringStatusListCredential.'
              );
            }
          });
          it('If present, ' +
            'statusSize MUST be an integer greater than zero.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20present%2C%20statusSize%20MUST%20be%20an%20integer%20greater%20than%20zero.';
            for(statusEntry in statusEntries) {
              if('statusSize' in statusEntries[statusEntry]) {
                statusEntries[statusEntry].statusSize.should.be.a('number',
                  'Expected statusSize to be an integer.');
                // TODO test for integer
                assert(Number.isInteger(
                  statusEntries[statusEntry].statusSize),
                'Expected statusSize to be an integer.');
                statusEntries[statusEntry].statusSize.should.be.gt(0,
                  'Expected statusSize to be greater than zero.');
              } else {
                this.skip();
              }
            }
          });
          it('If statusSize is provided and is greater than 1, ' +
            'then the property credentialStatus.statusMessage ' +
            'MUST be present.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20statusSize%20is%20provided%20and%20is%20greater%20than%201%2C%20then%20the%20property%20credentialStatus.statusMessage%20MUST%20be%20present';
            for(statusEntry in statusEntries) {
              if('statusSize' in statusEntries[statusEntry] &&
                Number.isInteger(statusEntries[statusEntry].statusSize) &&
                statusEntries[statusEntry].statusSize.gt(1)) {
                statusEntries[statusEntry].should.have.own.property(
                  'statusMessage');
              } else {
                this.skip();
              }
            }
          });
          it('The number of status messages MUST equal the number ' +
            'of possible values.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=the%20number%20of%20status%20messages%20MUST%20equal%20the%20number%20of%20possible%20values';
            for(statusEntry in statusEntries) {
              if('statusSize' in statusEntries[statusEntry] &&
                'statusMessage' in statusEntries[statusEntry]) {
                statusEntries[statusEntry].statusMessage.should.be.
                  an('array').length.should.be.
                  equal(statusEntries[statusEntry].statusSize);
              } else {
                this.skip();
              }
            }
          });
          it('If present, the statusMessage property MUST be an ' +
            'array, the length of which MUST equal the number ' +
            'of possible status messages indicated by statusSize.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20present%2C%20the%20statusMessage%20property%20MUST%20be%20an%20array%2C%20the%20length%20of%20which%20MUST%20equal%20the%20number%20of%20possible%20status%20messages%20indicated%20by%20statusSize';
            for(statusEntry in statusEntries) {
              if('statusMessage' in statusEntries[statusEntry] &&
                'statusSize' in statusEntries[statusEntry]) {
                statusEntries[statusEntry].statusMessage.should.be.
                  an('array').length.should.be.
                  equal(statusEntries[statusEntry].statusSize,
                    'Expected statusMessage lenght to be equal to ' +
                    'statusSize.');
              } else {
                this.skip();
              }
            }
          });
          it('statusMessage MAY be present if statusSize is 1, ' +
          'and MUST be present if statusSize is greater than 1.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=statusMessage%20MAY%20be%20present%20if%20statusSize%20is%201%2C%20and%20MUST%20be%20present%20if%20statusSize%20is%20greater%20than%201';
            for(statusEntry in statusEntries) {
              if('statusSize' in statusEntries[statusEntry] &&
                Number.isInteger(statusEntries[statusEntry].statusSize) &&
                statusEntries[statusEntry].statusSize.gt(1)
              ) {
                statusEntries[statusEntry].should.have.own.property(
                  'statusMessage');
              } else {
                this.skip();
              }
            }
          });
          it('If the statusMessage array is present, each ' +
            'element MUST contain the two properties "status" ' +
            'and "message".',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20the%20statusMessage%20array%20is%20present%2C%20each%20element%20MUST%20contain%20the%20two%20properties%20described%20below%2C%20and%20MAY%20contain%20additional%20properties.';
            for(statusEntry in statusEntries) {
              if('statusMessage' in statusEntries[statusEntry]) {
                // TODO this needs more testing:
                // a string representing the hexadecimal
                // value of the status prefixed with 0x
                statusEntries[statusEntry].
                  statusMessage.should.each.have.property(
                    'status').that.is.a('string');
                statusEntries[statusEntry].
                  statusMessage.should.each.have.property(
                    'message').that.is.a('string');
              } else {
                this.skip();
              }
            }
          });
          it('If present, the "statusReference" value MUST be a URL or an ' +
              'array of URLs [URL] which dereference(s) to material related ' +
              'to the status.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20present%2C%20its%20value%20MUST%20be%20a%20URL%20or%20an%20array%20of%20URLs%20%5BURL%5D%20which%20dereference%20to%20material%20related%20to%20the%20status';
            for(statusEntry in statusEntries) {
              if('statusReference' in statusEntries[statusEntry]) {
                const statusReferenceType = typeof (
                  statusEntries[statusEntry].statusReference);
                statusReferenceType.should.be.oneOf(['string', 'object'],
                  'Expected statusReference to be an string or an array.');
                if(statusReferenceType === 'object') {
                  statusEntries[statusEntry].statusReference.should.be.an(
                    'array');
                  statusEntries[statusEntry].statusReference.forEach(
                    item => item.should.be.a('string'));
                }
                // TODO test for URLS
              } else {
                this.skip();
              }
            }
          });
        });
        describe('BitstringStatusList Credential', function() {
          let statusListCredential;
          let statusListCredentials;
          before(async function() {
            statusListCredentials = [];
            for(statusEntry in statusEntries) {
              statusListCredentials.push(
                (await getSlc(statusEntries[statusEntry])).slc);
            }
          });
          it('When a status list verifiable credential is published, ' +
            'it MUST be a conforming document, ' +
            'as defined in [VC-DATA-MODEL-2.0].',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=When%20a%20status%20list%20verifiable%20credential%20is%20published%2C%20it%20MUST%20be%20a%20conforming%20document%2C%20as%20defined%20in%20%5BVC%2DDATA%2DMODEL%2D2.0%5D';
            for(statusListCredential in statusListCredentials) {
              testSlCredential({slCredential:
                statusListCredentials[statusListCredential]},
              'Expected status credential to conform to VCDM 2.0.');
            }
          });
          it.skip('The verifiable credential that contains the status ' +
            'list MAY express an id property that matches the value ' +
            'specified in statusListCredential for the corresponding ' +
            'BitstringStatusListEntry.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20verifiable%20credential%20that%20contains%20the%20status%20list%20MAY%20express%20an%20id%20property%20that%20matches%20the%20value%20specified%20in%20statusListCredential%20for%20the%20corresponding%20BitstringStatusListEntry';
          });
          it('The verifiable credential that contains the status list ' +
            'MUST express a type property that includes the ' +
            'BitstringStatusListCredential value.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20verifiable%20credential%20that%20contains%20the%20status%20list%20MUST%20express%20a%20type%20property%20that%20includes%20the%20BitstringStatusListCredential%20value.';
            for(statusListCredential in statusListCredentials) {
              statusListCredentials[statusListCredential]
                .should.have.own.property(
                  'type').to.be.an('array',
                  'Expected type property to be a string or an array.'
                );
              statusListCredentials[statusListCredential]
                .type.should.include(
                  'BitstringStatusListCredential',
                  'Expected credential status type to include ' +
                  'BitstringStatusListCredential.');
            }
          }
          );
          it('The type of the credential subject, which is the status list, ' +
            'MUST be BitstringStatusList.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20type%20of%20the%20credential%20subject%2C%20which%20is%20the%20status%20list%2C%20MUST%20be%20BitstringStatusList.';
            for(statusListCredential in statusListCredentials) {
              statusListCredentials[statusListCredential].
                credentialSubject.should.have.own.property(
                  'type').to.be.a('string',
                  'Expected type property to be a string.'
                );
              statusListCredentials[statusListCredential].
                credentialSubject.type.should.equal(
                  'BitstringStatusList',
                  'Expected credential status type to be ' +
                  'BitstringStatusList.'
                );
            }
          });
          it('The value of the purpose property of the status entry, ' +
            'statusPurpose, MUST be one or more strings.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20value%20of%20the%20purpose%20property%20of%20the%20status%20entry%2C%20statusPurpose%2C%20MUST%20be%20one%20or%20more%20strings.';
            for(statusListCredential in statusListCredentials) {
              const statusPurposeType = typeof (
                statusListCredentials[statusListCredential].
                  credentialSubject.statusPurpose);
              statusPurposeType.should.be.oneOf(['string', 'object']);
              if(statusPurposeType === 'object') {
                const credentialSubject =
                  statusListCredentials[statusListCredential].credentialSubject;
                credentialSubject.statusPurpose.should.be.an(
                  'array');
                credentialSubject.statusPurpose.forEach(
                  item => item.should.be.a('string'));
              }
            }
          }
          );
          it('The encodedList property of the credential subject MUST ' +
            'be a Multibase-encoded base64url (with no padding) [RFC4648] ' +
            'representation of the GZIP-compressed [RFC1952] bitstring ' +
            'values for the associated range of verifiable credential status ' +
            'values.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20encodedList%20property%20of%20the%20credential%20subject%20MUST%20be%20a%20Multibase%2Dencoded%20base64url%20(with%20no%20padding)%20%5BRFC4648%5D%20representation%20of%20the%20GZIP%2Dcompressed%20%5BRFC1952%5D%20bitstring%20values%20for%20the%20associated%20range%20of%20verifiable%20credential%20status%20values.';
            for(statusListCredential in statusListCredentials) {
              const credentialSubject =
                statusListCredentials[statusListCredential].credentialSubject;
              const {encodedList} = credentialSubject;
              // Uncompress encodedList
              const decoded = await sl.decodeList({encodedList});
              should.exist(decoded,
                'Expected encodedList to be a Multibase-encoded base64url' +
                'representation of a GZIP-compressed bitstring.');
            }
          }
          );
          it('The uncompressed bitstring MUST be at least 16KB in size.',
            async function() {
              this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20uncompressed%20bitstring%20MUST%20be%20at%20least%2016KB%20in%20size.';
              for(statusListCredential in statusListCredentials) {
                const credentialSubject =
                  statusListCredentials[statusListCredential].credentialSubject;
                const {encodedList} = credentialSubject;
                // Uncompress encodedList
                const decoded = await sl.decodeList({encodedList});
                should.exist(decoded);
                // decoded size should be 16kb
                const decodedSize = (decoded.length / 8) / 1024;
                decodedSize.should.be.gte(16,
                  'Expected bitstring to be at least 16KB in size.'
                );
              }
            }
          );
          it('The bitstring MUST be encoded such that the first index, ' +
            'with a value of zero (0), is located at the left-most bit ' +
            'in the bitstring and the last index, with a value of ' +
            'one less than the length of the bitstring ' +
            '(bitstring_length - 1), is located at the right-most ' +
            'bit in the bitstring.',
          async function() {
            this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20bitstring%20MUST,Bitstring%20Encoding.';
            for(statusListCredential in statusListCredentials) {
              const credentialSubject =
                statusListCredentials[statusListCredential].credentialSubject;
              const {encodedList} = credentialSubject;
              const decoded = await sl.decodeList({encodedList});
              decoded.bitstring.bits[0].should.be.equal(0);
              decoded.bitstring.bits[
                decoded.bitstring.bits.length - 1].should.be.equal(0);
            }
          }
          );
        });
      });
    }
  });
