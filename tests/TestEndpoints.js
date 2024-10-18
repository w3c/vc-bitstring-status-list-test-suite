/*
 * Copyright 2024 Digital Bazaar, Inc.
 *
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  createRequestBody,
  createVerifyRequestBody
} from './mock.data.js';
import {addJsonAttachment} from './helpers.js';

export class TestEndpoints {
  constructor({implementation, tag}) {
    this.implementation = implementation;
    this.tag = tag;
    this.issuer = implementation.issuers?.find(
      issuer => issuer.tags.has(tag)) || null;
    this.verifier = implementation.verifiers?.find(
      verifier => verifier.tags.has(tag)) || null;
  }
  async issue(credential) {
    const {issuer} = this;
    const issueBody = createRequestBody({issuer, vc: credential});
    await addJsonAttachment('Request', issueBody);
    const response = post(issuer, issueBody);
    await addJsonAttachment('Response', response);
    return response;
  }
  async verify(vc) {
    const {verifier} = this;
    const verifyBody = createVerifyRequestBody({verifier, vc});
    await addJsonAttachment('Request', verifyBody);
    const result = post(this.verifier, verifyBody);
    if(result?.errors?.length) {
      throw result.errors[0];
    }
    await addJsonAttachment('Response', result);
    return result;
  }
}

export async function post(endpoint, object) {
  // Use vc-test-suite-implementations for HTTPS requests.
  const {data, error} = await endpoint.post({json: object});
  if(error) {
    throw error;
  }
  return data;
}
