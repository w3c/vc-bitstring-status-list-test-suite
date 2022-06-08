/**
 *
 *  Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
*/
import {contextMap} from './contexts.js';
import {httpClient} from '@digitalbazaar/http-client';
import https from 'https';
import {JsonLdDocumentLoader} from 'jsonld-document-loader';

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

// add contexts to documentLoader
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

const documentLoader = jdl.build();
export {documentLoader};
