/**
 *
 *  Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const {JsonLdDocumentLoader} = require('jsonld-document-loader');
const {contextMap} = require('./contexts');
const jdl = new JsonLdDocumentLoader();

// add contexts to documentLoad
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

module.exports = jdl.build();
