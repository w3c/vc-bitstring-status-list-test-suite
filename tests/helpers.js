/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const https = require('https');
const {httpClient} = require('@digitalbazaar/http-client');
const {decodeList} = require('@digitalbazaar/vc-status-list');

const agent = new https.Agent({rejectUnauthorized: false});

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

module.exports = {
  ISOTimeStamp,
  deepClone,
  unwrapResponse,
  getCredentialStatus
};
