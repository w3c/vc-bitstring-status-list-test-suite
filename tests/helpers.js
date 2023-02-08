/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {createRequire} from 'node:module';
import {decodeList} from '@digitalbazaar/vc-status-list';
import {documentLoader} from './documentLoader.js';
import {httpClient} from '@digitalbazaar/http-client';
import https from 'https';
import {v4 as uuidv4} from 'uuid';
const require = createRequire(import.meta.url);
const validVc = require('../credentials/validVc.json');
const agent = new https.Agent({rejectUnauthorized: false});

// Javascript's default ISO timestamp contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
export const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};

export const getCredentialStatus = async ({verifiableCredential}) => {
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

// copies a validVc and adds an id.
export const createValidVc = ({issuer}) => {
  const {settings: {id: issuerId}} = issuer;
  return {
    ...validVc,
    id: `urn:uuid:${uuidv4()}`,
    issuanceDate: ISOTimeStamp(),
    issuer: issuerId
  };
};

export const getSlc = async ({issuedVc}) => {
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
export const createRequestBody = ({vc, setStatus = false, statusPurpose}) => {
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
