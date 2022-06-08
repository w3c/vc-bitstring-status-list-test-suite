/**
 *
 *  Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
*/
import credentialsCtx from 'credentials-context';
import didCtx from '@digitalcredentials/did-context';
import ed25519Ctx from 'ed25519-signature-2020-context';
import statusListCtx from '@digitalbazaar/vc-status-list-context';

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

export {contextMap};
