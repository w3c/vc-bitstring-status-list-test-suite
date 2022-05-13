/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {decodeList} = require('@digitalbazaar/vc-status-list');
const documentLoader = require('./documentLoader.js');
const {httpClient} = require('@digitalbazaar/http-client');
const https = require('https');
const {v4: uuidv4} = require('uuid');
const {validVc} = require('../credentials');

const agent = new https.Agent({rejectUnauthorized: false});

// Javascript's default ISO timestamp contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};

const getCredentialStatus = async ({verifiableCredential}) => {
  const {credentialStatus} = verifiableCredential;
  const {statusListCredential} = credentialStatus;
  // get StatusList Credential for the VC
  const {data: slc} = await httpClient.get(
    statusListCredential, {agent});
  const {credentialSubject: {encodedList}} = slc;
  const list = await decodeList({encodedList});
  const statusListIndex = parseInt(
    credentialStatus.statusListIndex, 10);
  const status = list.getStatus(statusListIndex);
  return {status, statusListCredential};
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

const getSlc = async ({issuedVc}) => {
  const {credentialStatus: {statusListCredential}} = issuedVc;
  const {document} = await documentLoader(statusListCredential);
  return {slc: document};
};

/**
 * Creates a request body.
 *
 * @param {object} options - The options to use.
 * @param {object} options.vc - The verifiable credential to send in request.
 * @param {boolean} options.setStatus - The verifiable credential to send in
 *   request.
 * @param {string} [options.statusPurpose] - The purpose of the status entry.
 *   "statusPurpose" must be set if "setStatus" is set to true. The values
 *   "revocation" or "suspension" must be used.
 *
 * @returns {object} - A request body.
 */
const createRequestBody = ({vc, setStatus = false, statusPurpose}) => {
  let body = {
    verifiableCredential: vc,
    options: {
      checks: ['proof', 'credentialStatus'],
    }
  };
  if(setStatus) {
    body = {
      credentialId: vc.id,
      credentialStatus: {
        type: 'StatusList2021Entry',
        statusPurpose
      }
    };
  }
  return body;
};

module.exports = {
  createRequestBody,
  createValidVc,
  getCredentialStatus,
  getSlc,
  ISOTimeStamp
};
