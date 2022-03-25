/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const {decodeSecretKeySeed} = require('bnid');
const {decodeList} = require('@digitalbazaar/vc-status-list');
const didKey = require('@digitalbazaar/did-method-key');
const {Ed25519Signature2020} = require('@digitalbazaar/ed25519-signature-2020');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const {ZcapClient} = require('@digitalbazaar/ezcap');

const agent = new https.Agent({rejectUnauthorized: false});
const didKeyDriver = didKey.driver();

// Javascript's default ISO timestamp is contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};

const deepClone = data => JSON.parse(JSON.stringify(data, null, 2));

const unwrapResponse = data => {
  if(data['@context']) {
    return data;
  }
  // if the response.data is not directly jsonld unwrap it
  for(const key of Object.keys(data)) {
    const prop = data[key];
    // recurse through each key looking for jsonld
    const jsonld = unwrapResponse(prop);
    // when we find the first context that should be the VC
    if(jsonld) {
      return jsonld;
    }
  }
  return false;
};

const getCredentialStatus = async ({verifiableCredential}) => {
  // get SLC for the VC
  const {credentialStatus} = verifiableCredential;
  // FIXME: support `statusListCredential` as well
  const {revocationListCredential} = credentialStatus;
  const {data: slc} = await httpClient.get(
    revocationListCredential, {agent});

  const {encodedList} = slc.credentialSubject;
  const list = await decodeList({encodedList});
  // FIXME: support `statusListIndex` as well
  const statusListIndex = parseInt(
    credentialStatus.revocationListIndex, 10);
  const status = list.getStatus(statusListIndex);
  return {status, statusListCredential: revocationListCredential};
};

async function getZcapClient() {
  if(!process.env.CLIENT_SECRET_DB) {
    throw new Error('ENV variable CLIENT_SECRET_DB is required.');
  }
  const secretKeySeed = process.env.CLIENT_SECRET_DB;
  const seed = await decodeSecretKeySeed({secretKeySeed});
  const didKey = await didKeyDriver.generate({seed});
  const {didDocument: {capabilityInvocation}} = didKey;
  const zcapClient = new ZcapClient({
    SuiteClass: Ed25519Signature2020,
    invocationSigner: didKey.keyPairs.get(capabilityInvocation[0]).signer(),
    agent
  });
  return zcapClient;
}

module.exports = {
  ISOTimeStamp,
  deepClone,
  unwrapResponse,
  getCredentialStatus,
  getZcapClient
};
