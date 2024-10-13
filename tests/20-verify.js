/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
    addPerTestMetadata, createRequestBody, getCredentialStatus, updateStatus, setupMatrix
} from './helpers.js';
import { filterByTag, filterImplementations } from
    'vc-test-suite-implementations';
import { shouldFailVerification, shouldPassVerification } from './assertions.js';
import { klona } from 'klona';
import { TestEndpoints } from './TestEndpoints.js';

const tag = 'BitstringStatusList';
const { match } = filterByTag({ tags: [tag] });

describe('BitstringStatusList Credentials (Verify)', function () {
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
