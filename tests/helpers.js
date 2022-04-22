/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {decodeList} = require('@digitalbazaar/vc-status-list');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');

const agent = new https.Agent({rejectUnauthorized: false});

// Javascript's default ISO timestamp is contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
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

/**
 * Takes in a Map and a predicate and returns a new Map
 * only returning key value pairs that are true.
 *
 * @param {object} options - Options to use.
 * @param {Map} options.map - A Map.
 * @param {Function<boolean>} options.predicate - A function to
 * filter the map's entries on.
 *
 * @returns {Map} Returns a map.
 */
const filterMap = ({map, predicate}) => {
  const filtered = new Map();
  for(const [key, value] of map) {
    const result = predicate({key, value});
    if(result === true) {
      filtered.set(key, value);
    }
  }
  return filtered;
};
module.exports = {
  ISOTimeStamp,
  filterMap,
  getCredentialStatus
};
