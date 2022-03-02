/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const https = require('https');
const {httpClient} = require('@digitalbazaar/http-client');
const {ISOTimeStamp} = require('./helpers');
const {v4: uuidv4} = require('uuid');
const {signCapabilityInvocation} =
  require('@digitalbazaar/http-signature-zcap-invoke');
const didKey = require('@digitalbazaar/did-method-key');
const {decodeSecretKeySeed} = require('bnid');

const didKeyDriver = didKey.driver();

const agent = new https.Agent({rejectUnauthorized: false});

const _headers = {
  Accept: 'application/ld+json,application/json',
  'Content-Type': 'application/json',
};

class Implementation {
  constructor(settings) {
    this.settings = settings;
  }
  async issue({credential}) {
    try {
      const expires = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2);
        return ISOTimeStamp({date});
      };
      const body = {
        credential: {
          ...credential,
          id: `urn:uuid:${uuidv4()}`,
          issuanceDate: ISOTimeStamp(),
          expirationDate: expires(),
          issuer: this.settings.issuer.id,
          '@context': credential['@context']
        }
      };
      const headers = {
        ..._headers,
        ...this.settings.issuer.headers
      };
      if(this.settings.issuer.zcap) {
        const signatureHeaders = await _createSignatureHeaders({
          url: this.settings.issuer.endpoint,
          method: 'post',
          json: body,
          zcap: this.settings.issuer.zcap,
          action: 'write'
        });
        Object.assign(headers, signatureHeaders);
      }
      const result = await httpClient.post(
        this.settings.issuer.endpoint,
        {headers, agent, json: body}
      );
      return result;
    } catch(e) {
      // this is just to make debugging easier
      console.error(e);
      throw e;
    }
  }
  async setStatus(body) {
    const headers = {
      ..._headers,
      ...this.settings.issuer.headers
    };
    if(this.settings.issuer.zcap) {
      const signatureHeaders = await _createSignatureHeaders({
        url: 'did:key:z6MkptjaoxjyKQFSqf1dHXswP6EayYhPQBYzprVCPmGBHz9S',
        method: 'post',
        json: body,
        zcap: `urn:zcap:root:${encodeURIComponent(
          'did:key:z6MkptjaoxjyKQFSqf1dHXswP6EayYhPQBYzprVCPmGBHz9S')}`,
        action: 'write'
      });
      console.log(signatureHeaders, 'signatureHeaders');
      Object.assign(headers, signatureHeaders);
    }
    let result;
    try {
      result = await httpClient.post(
        this.settings.issuer.statusEndpoint,
        {headers, agent, json: body});
    } catch(e) {
      console.log(JSON.stringify(e.data, null, 2), '<><><><>e');
      throw e;
    }
    return result;
  }
  async verify({credential, auth}) {
    try {
      const body = {
        verifiableCredential: credential,
        options: {
          checks: ['proof', 'credentialStatus'],
        },
      };
      const headers = {
        ..._headers,
        ...this.settings.issuer.headers
      };
      if(auth && auth.type === 'oauth2-bearer-token') {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      if(this.settings.verifier.zcap) {
        const signatureHeaders = await _createSignatureHeaders({
          url: this.settings.verifier.endpoint,
          method: 'post',
          json: body,
          zcap: this.settings.verifier.zcap,
          action: 'write'
        });
        Object.assign(headers, signatureHeaders);
      }
      const result = await httpClient.post(
        this.settings.verifier.endpoint,
        {headers, agent, json: body}
      );
      return result;
    } catch(e) {
      // this is just to make debugging easier
      if(e && e.response && e.response.data) {
        throw new Error(JSON.stringify(e.response.data, null, 2));
      }
      throw e;
    }
  }
}

async function _createSignatureHeaders({url, method, json, zcap, action}) {
  let capability;
  if(!zcap.startsWith('urn:zcap:root:')) {
    capability = JSON.parse(zcap);
  } else {
    capability = zcap;
  }
  const secretKeySeed = process.env.CLIENT_SECRET;
  const seed = await decodeSecretKeySeed({secretKeySeed});
  const didKey = await didKeyDriver.generate({seed});
  const {didDocument: {capabilityInvocation}} = didKey;
  const signatureHeaders = await signCapabilityInvocation({
    url,
    method,
    headers: {
      date: new Date().toUTCString()
    },
    json,
    invocationSigner: didKey.keyPairs.get(capabilityInvocation[0]).signer(),
    capability,
    capabilityAction: action
  });
  return signatureHeaders;
}

module.exports = Implementation;
