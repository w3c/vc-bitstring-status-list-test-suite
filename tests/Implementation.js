/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const https = require('https');
const {ISOTimeStamp} = require('./helpers');
const {v4: uuidv4} = require('uuid');
const {httpClient} = require('@digitalbazaar/http-client');
const {getZcapClient} = require('./helpers');
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
      let result;
      if(this.settings.issuer.credentialsZcap) {
        const capability = JSON.parse(this.settings.issuer.credentialsZcap);
        const zcapClient = await getZcapClient();
        result = await zcapClient.write({
          url: this.settings.issuer.issueCrendentialEndpoint,
          headers,
          capability,
          json: body
        });
      } else {
        result = await httpClient.post(
          this.settings.issuer.issueCrendentialEndpoint,
          {headers, agent, json: body}
        );
      }
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
    try {
      let result;
      if(this.settings.issuer.credentialsZcap) {
        const capability = JSON.parse(this.settings.issuer.credentialsZcap);
        const zcapClient = await getZcapClient();
        result = await zcapClient.write({
          url: this.settings.issuer.statusEndpoint,
          headers,
          capability,
          json: body
        });
      } else {
        result = await httpClient.post(
          this.settings.issuer.statusEndpoint,
          {headers, agent, json: body}
        );
      }
      return result;
    } catch(e) {
      throw e;
    }
  }
  async publishSlc(body) {
    const headers = {
      ..._headers,
      ...this.settings.issuer.headers
    };
    try {
      let result;
      if(this.settings.issuer.slcsZcap) {
        const capability = JSON.parse(this.settings.issuer.slcsZcap);
        const zcapClient = await getZcapClient();
        result = await zcapClient.write({
          url: this.settings.issuer.publishSlcEndpoint,
          headers,
          capability,
          json: body
        });
      } else {
        result = await httpClient.post(
          this.settings.issuer.publishSlcEndpoint,
          {headers, agent, json: body}
        );
      }
      return result;
    } catch(e) {
      throw e;
    }
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
        ...this.settings.verifier.headers
      };
      if(auth && auth.type === 'oauth2-bearer-token') {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      let result;
      if(this.settings.verifier.verifierZcap) {
        const capability = JSON.parse(this.settings.verifier.verifierZcap);
        const zcapClient = await getZcapClient();
        result = await zcapClient.write({
          url: this.settings.verifier.verifyEndpoint,
          capability,
          json: body
        });
      } else {
        result = await httpClient.post(
          this.settings.verifier.verifyEndpoint,
          {headers, agent, json: body}
        );
      }
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

module.exports = Implementation;
