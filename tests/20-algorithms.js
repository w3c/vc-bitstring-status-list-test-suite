/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
  addPerTestMetadata,
  decodeSl,
  getStatusEntries,
  getStatusListCredentials,
  issueValidVc,
  setupMatrix,
} from './helpers.js';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {filterByTag} from
  'vc-test-suite-implementations';
import {TestEndpoints} from './TestEndpoints.js';
import {testSlCredential} from './assertions.js';

const require = createRequire(import.meta.url);
const tag = 'BitstringStatusList';
const {match} = filterByTag({tags: [tag]});

describe('Algorithm', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      before(async function() {
      });
      beforeEach(addPerTestMetadata);
      it('If an implementation of any of the algorithms in this section ' +
        'processes a property defined in Section 2. Data Model whose value ' +
        'is malformed due to not complying with associated "MUST" ' +
        'statements, a MALFORMED_VALUE_ERROR MUST be raised.',
      async function() {
        this.test.link = '';
        const credential = JSON.parse(
          JSON.stringify(require('./validVc.json'))
        );

        // Create a negative fixture
        credential.statusEntry = {
          type: 'BitstringStatusListEntry',
          statusListIndex: true,
          statusListCredential: 'https://example.com',
        };
        await assert.rejects(endpoints.issue(credential),
          'Failed to reject a credential with an invalid ' +
          'BitstringStatusListEntry.');
        // TODO add verifier tests, requires negative fixtures
      });
    });
  }
});

describe('Algorithm: Generate Algorithm', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      let statusEntries;
      let statusListCredential;
      let statusListCredentials;
      before(async function() {
        issuedVc = await issueValidVc(endpoints, name);
        statusEntries = await getStatusEntries(issuedVc);
        statusListCredentials = await getStatusListCredentials(statusEntries);
      });
      beforeEach(addPerTestMetadata);
      it('The following process, or one generating the exact output, ' +
        'MUST be followed when producing a BitstringStatusListCredential.',
      async function() {
        this.test.link = '';
        for(statusListCredential of statusListCredentials) {
          testSlCredential({slCredential: statusListCredential});
        }
      });
    });
  }
});

describe('Algorithm: Validate Algorithm', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      before(async function() {
        issuedVc = await issueValidVc(endpoints, name);
      });
      beforeEach(addPerTestMetadata);
      it('The following process, or one generating the exact output, ' +
        'MUST be followed when validating a verifiable credential that ' +
        'is contained in a BitstringStatusListCredential',
      async function() {
        this.test.link = '';
        await assert.doesNotReject(endpoints.verify(issuedVc));
        // TODO add negative verifier tests
      });
      it('If the credentialIndex multiplied by the size is a value ' +
        'outside of the range of the bitstring, a RANGE_ERROR MUST ' +
        'be raised.',
      async function() {
        this.test.link = '';
        this.test.cell.skipMessage = 'Missing negative test fixtures.';
        this.skip();
      });
      it('When a statusListCredential URL is dereferenced, ' +
        'server implementations MAY provide a mechanism to dereference ' +
        'the status list as of a particular point in time If such a feature ' +
        'is supported, and if query parameters are supported by ' +
        'the URL scheme, then the name of the query parameter MUST ' +
        'be timestamp and the value MUST be a valid URL-encoded ' +
        '[XMLSCHEMA11-2] dateTimeStamp string value.',
      async function() {
        this.test.link = '';
        this.test.cell.skipMessage = 'No feature support.';
        this.skip();
      });
      it('The result of dereferencing such a timestamp-parameterized ' +
        'URL MUST be either a status list credential containing the ' +
        'status list as it existed at the given point in time, or a ' +
        'STATUS_RETRIEVAL_ERROR.',
      async function() {
        this.test.link = '';
        this.test.cell.skipMessage = 'No feature support.';
        this.skip();
      });
    });
  }
});

describe('Algorithm: Bitstring Generation Algorithm', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      let statusEntries;
      let statusListCredential;
      let statusListCredentials;
      before(async function() {
        issuedVc = await issueValidVc(endpoints, name);
        statusEntries = await getStatusEntries(issuedVc);
        statusListCredentials = await getStatusListCredentials(statusEntries);
      });
      beforeEach(addPerTestMetadata);
      it('The following process, or one generating the exact output, ' +
        'MUST be followed when generating a status list bitstring.',
      async function() {
        this.test.link = '';
        for(statusListCredential of statusListCredentials) {
          const credentialSubject =
                statusListCredential.credentialSubject;
          const {encodedList} = credentialSubject;
          await decodeSl({encodedList});
        }
      });
    });
  }
});

describe('Algorithm: Bitstring Expansion Algorithm', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      let issuedVc;
      before(async function() {
        issuedVc = await issueValidVc(endpoints, name);
      });
      beforeEach(addPerTestMetadata);
      it('The following process, or one generating the exact output, ' +
        'MUST be followed when expanding a compressed status ' +
        'list bitstring.',
      async function() {
        this.test.link = '';
        await assert.doesNotReject(endpoints.verify(issuedVc));
        // TODO add negative verifier tests
      });
    });
  }
});

describe('Algorithm: Processing Errors', function() {
  setupMatrix.call(this, match);
  for(const [name, implementation] of match) {
    const endpoints = new TestEndpoints({implementation, tag});
    describe(name, function() {
      before(async function() {
      });
      beforeEach(addPerTestMetadata);
      it('The type value of the error object MUST be a URL that ' +
        'starts with the value https://www.w3.org/ns/credentials/status-list# ' +
        'and ends with the value in the section listed below.',
      async function() {
        this.test.link = '';
        this.test.cell.skipMessage = 'Missing negative test fixtures.';
        this.skip();
        await assert.rejects(endpoints.verify({}));
        // STATUS_RETRIEVAL_ERROR
        // STATUS_VERIFICATION_ERROR
        // STATUS_LIST_LENGTH_ERROR
      });
    });
  }
});
