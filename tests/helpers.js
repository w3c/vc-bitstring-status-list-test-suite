/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {decodeList} = require('@digitalbazaar/vc-status-list');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const {v4: uuidv4} = require('uuid');
const {validVc} = require('../credentials');

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

const expires = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 2);
  return ISOTimeStamp({date});
};

// copies a validVc and adds an id.
const createValidVc = ({issuerId}) => ({
  ...validVc,
  id: `urn:uuid:${uuidv4()}`,
  issuanceDate: ISOTimeStamp(),
  expirationDate: expires(),
  issuer: issuerId
});

module.exports = {
  createValidVc,
  getCredentialStatus,
  ISOTimeStamp
};
