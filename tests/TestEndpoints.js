/*
 * Copyright 2024 Digital Bazaar, Inc.
 *
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {
  createRequestBody,
  createVerifyRequestBody
} from './mock.data.js';

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
    const response = await post(issuer, issueBody);
    return response?.verifiableCredential || response;
  }
  async verify(vc) {
    const verifyBody = createVerifyRequestBody({vc});
    const result = post(this.verifier, verifyBody);
    if(result?.errors?.length) {
      throw result.errors[0];
    }
    return result;
  }
}

export async function post(endpoint, object) {
  return fetch(endpoint.settings.endpoint, {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(object)
  })
    .then(function(response) {
      if(response.status >= 400) {
        throw new Error('Error');
      } else {
        return response.json();
      }
    });
}
