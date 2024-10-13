/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
    addPerTestMetadata, createRequestBody, getCredentialStatus, issueVc, updateStatus, setupMatrix
} from './helpers.js';
import { filterByTag, filterImplementations } from
    'vc-test-suite-implementations';
import { shouldFailVerification, shouldPassVerification } from './assertions.js';
import { klona } from 'klona';
import { TestEndpoints } from './TestEndpoints.js';

const tag = 'BitstringStatusList';
const { match } = filterByTag({ tags: [tag] });

describe('Algorithm: Generate Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            let issuedVc;
            before(async function () {
              try {
                issuedVc = await endpoints.issue(require(
                  './validVc.json'));
              } catch (e) {
                console.error(
                  `Issuer: ${name} failed to issue "credential-ok.json".`,
                  e
                );
              }
            });
            beforeEach(addPerTestMetadata);
            it('MUST verify a valid "BitstringStatusListCredential" with ' +
                '"revocation" status purpose', async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: validVcForRevocation })
                    });
                    shouldPassVerification({ result, error, statusCode });
                });
            it('MUST verify a valid "BitstringStatusListCredential" with ' +
                '"suspension" status purpose', async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: validVcForSuspension })
                    });
                    shouldPassVerification({ result, error, statusCode });
                });
            it('MUST fail to verify a VC with invalid ' +
                '"credentialStatus.statusListCredential"', async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    const invalidStatusListCredential = klona(validVcForRevocation);
                    invalidStatusListCredential.credentialStatus.statusListCredential =
                        'invalid-statusListCredential';
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: invalidStatusListCredential })
                    });
                    shouldFailVerification({ result, error, statusCode });
                });
            it('MUST fail to verify a VC with invalid "credentialStatus.type"',
                async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    const invalidCredentialStatusType = klona(validVcForRevocation);
                    invalidCredentialStatusType.credentialStatus.type = 'invalid-type';
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: invalidCredentialStatusType })
                    });
                    shouldFailVerification({ result, error, statusCode });
                });
            it('MUST fail to verify a revoked status list credential',
                async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    // get the status of the VC
                    const statusInfo = await getCredentialStatus({
                        verifiableCredential: validVcForRevocation
                    });
                    statusInfo.status.should.equal(false);
                    // verification of the credential should pass
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: validVcForRevocation })
                    });
                    shouldPassVerification({ result, error, statusCode });
                    // update the status of the VC and revoke it
                    const revokedVc = await updateStatus({
                        vc: validVcForRevocation, setStatusList: setRevocationStatusList,
                        publishStatusList: publishRevocationStatusList, statusInfo,
                        statusPurpose: 'revocation'
                    });
                    // try to verify the credential after revocation, should fail since it
                    // has now been revoked
                    const {
                        result: result2, error: err2, statusCode: statusCode2
                    } = await verifier.post({
                        json: createRequestBody({ vc: revokedVc })
                    });
                    shouldFailVerification({
                        result: result2, error: err2, statusCode: statusCode2
                    });
                });
            it('MUST fail to verify a suspended status list credential',
                async function () {
                    this.test.cell.skipMessage = 'Pending verifier tests.';
                    this.skip();
                    // get the status of the VC
                    const statusInfo = await getCredentialStatus({
                        verifiableCredential: validVcForSuspension
                    });
                    statusInfo.status.should.equal(false);
                    // verification of the credential should pass
                    const { result, error, statusCode } = await verifier.post({
                        json: createRequestBody({ vc: validVcForSuspension })
                    });
                    shouldPassVerification({ result, error, statusCode });
                    // update the status of the VC and suspend it
                    const suspendedVc = await updateStatus({
                        vc: validVcForSuspension, setStatusList: setSuspensionStatusList,
                        publishStatusList: publishSuspensionStatusList, statusInfo,
                        statusPurpose: 'suspension'
                    });
                    // try to verify the credential after suspension, should fail since it
                    // has now been suspended
                    const {
                        result: result2, error: err2, statusCode: statusCode2
                    } = await verifier.post({
                        json: createRequestBody({ vc: suspendedVc })
                    });
                    shouldFailVerification({
                        result: result2, error: err2, statusCode: statusCode2
                    });
                });
        });
    }
});

describe('Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('If an implementation of any of the algorithms in this section processes a property defined in Section 2. Data Model whose value is malformed due to not complying with associated "MUST" statements, a MALFORMED_VALUE_ERROR MUST be raised.', async function () {
                this.test.link = '';
            });
        });
    }
});

describe('Algorithm: Generate Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('The following process, or one generating the exact output, MUST be followed when producing a BitstringStatusListCredential.', async function () {
                this.test.link = '';
            });
        });
    }
});

describe('Algorithm: Validate Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('The following process, or one generating the exact output, MUST be followed when validating a verifiable credential that is contained in a BitstringStatusListCredential', async function () {
                this.test.link = '';
            });
            it('If the credentialIndex multiplied by the size is a value outside of the range of the bitstring, a RANGE_ERROR MUST be raised.', async function () {
                this.test.link = '';
            });
            it('When a statusListCredential URL is dereferenced, server implementations MAY provide a mechanism to dereference the status list as of a particular point in time If such a feature is supported, and if query parameters are supported by the URL scheme, then the name of the query parameter MUST be timestamp and the value MUST be a valid URL-encoded [XMLSCHEMA11-2] dateTimeStamp string value.', async function () {
                this.test.link = '';
            });
            it('The result of dereferencing such a timestamp-parameterized URL MUST be either a status list credential containing the status list as it existed at the given point in time, or a STATUS_RETRIEVAL_ERROR.', async function () {
                this.test.link = '';
            });
        });
    }
});

describe('Algorithm: Bitstring Generation Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('The following process, or one generating the exact output, MUST be followed when generating a status list bitstring.', async function () {
                this.test.link = '';
            });
        });
    }
});

describe('Algorithm: Bitstring Expansion Algorithm', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('The following process, or one generating the exact output, MUST be followed when expanding a compressed status list bitstring.', async function () {
                this.test.link = '';
            });
        });
    }
});

describe('Algorithm: Processing Errors', function () {
    setupMatrix.call(this, match);
    for (const [name, implementation] of match) {
        const endpoints = new TestEndpoints({ implementation, tag });
        describe(name, function () {
            before(async function () {
              let issuedVc = issueVc(endpoints, name);
            });
            beforeEach(addPerTestMetadata);
            it('The type value of the error object MUST be a URL that starts with the value https://www.w3.org/ns/credentials/status-list# and ends with the value in the section listed below.', async function () {
                this.test.link = '';
            });
            it('The code value MUST be the integer code described in the table below (in parentheses, beside the type name).', async function () {
                this.test.link = '';
            });
        });
    }
});
