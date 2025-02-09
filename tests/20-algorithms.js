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
        this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=If%20an%20implementation%20of%20any%20of%20the%20algorithms%20in%20this%20section%20processes%20a%20property%20defined%20in%20Section%202.%20Data%20Model%20whose%20value%20is%20malformed%20due%20to%20not%20complying%20with%20associated%20%22MUST%22%20statements%2C%20a%20MALFORMED_VALUE_ERROR%20MUST%20be%20raised.';
        const credential = structuredClone(require('./validVc.json'));

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
        this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20following%20process%2C%20or%20one%20generating%20the%20exact%20output%2C%20MUST%20be%20followed%20when%20producing%20a%20BitstringStatusListCredential.';
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
        this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20following%20process%2C%20or%20one%20generating%20the%20exact%20output%2C%20MUST%20be%20followed%20when%20validating%20a%20verifiable%20credential%20that%20is%20contained%20in%20a%20BitstringStatusListCredential';
        await assert.doesNotReject(endpoints.verify(issuedVc));
        // TODO add negative verifier tests
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
        this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20following%20process%2C%20or%20one%20generating%20the%20exact%20output%2C%20MUST%20be%20followed%20when%20generating%20a%20status%20list%20bitstring.';
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
        this.test.link = 'https://www.w3.org/TR/vc-bitstring-status-list/#:~:text=The%20following%20process%2C%20or%20one%20generating%20the%20exact%20output%2C%20MUST%20be%20followed%20when%20expanding%20a%20compressed%20status%20list%20bitstring.';
        await assert.doesNotReject(endpoints.verify(issuedVc));
        // TODO add negative verifier tests
      });
    });
  }
});

