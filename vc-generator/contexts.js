/**
 *
 *  Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const ed25519Ctx = require('ed25519-signature-2020-context');
const didCtx = require('@digitalcredentials/did-context');
const credentialsCtx = require('credentials-context');
const statusListCtx = require('vc-status-list-context');

const contextMap = new Map();

// add contexts for the documentLoader
contextMap.set(ed25519Ctx.constants.CONTEXT_URL, ed25519Ctx.CONTEXT);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);
contextMap.set(
  credentialsCtx.constants.CONTEXT_URL,
  credentialsCtx.contexts.get(
    credentialsCtx.constants.CONTEXT_URL)
);
contextMap.set(
  statusListCtx.CONTEXT_URL_V1,
  statusListCtx.CONTEXT_V1
);

module.exports = {contextMap};
