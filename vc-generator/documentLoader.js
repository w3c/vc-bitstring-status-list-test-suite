/**
 *
 *  Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const {JsonLdDocumentLoader} = require('jsonld-document-loader');
const {contextMap} = require('./contexts.js');

const agent = new https.Agent({rejectUnauthorized: false});

const handler = {
  async get({url}) {
    if(!url.startsWith('http')) {
      throw new Error('NotFoundError');
    }
    let result;
    try {
      result = await httpClient.get(url, {agent});
    } catch(e) {
      throw new Error('NotFoundError');
    }
    return result.data;
  }
};

const jdl = new JsonLdDocumentLoader();
jdl.setProtocolHandler({protocol: 'https', handler});

// add contexts to documentLoad
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

module.exports = jdl.build();
