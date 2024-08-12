/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as base64url from 'base64url-universal';
// import * as sl from '@digitalbazaar/vc-status-list';
import chai from 'chai';
import {createRequire} from 'node:module';
import {decodeList} from '@digitalbazaar/vc-status-list';
import {documentLoader} from './documentLoader.js';
import {httpClient} from '@digitalbazaar/http-client';
import https from 'https';
import {klona} from 'klona';
import {ungzip} from 'pako';
import {v4 as uuidv4} from 'uuid';
const require = createRequire(import.meta.url);
const validVc = require('./validVc.json');
const agent = new https.Agent({rejectUnauthorized: false});

const should = chai.should();

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

export const issueVc = async ({issuer}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const credential = klona(validVc);
  credential.id = `urn:uuid:${uuidv4()}`;
  credential.issuer = issuerId;
  const body = {credential, options};
  return issuer.post({json: body});
};

export const getSlc = async statusEntry => {
  const {document} = await documentLoader(statusEntry.statusListCredential);
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
        type: 'BitstringStatusListEntry',
        statusPurpose
      }
    };
  }
  return body;
};

export async function updateStatus({
  vc, setStatusList, statusPurpose, statusInfo, publishStatusList
}) {
  const body = createRequestBody({vc, setStatus: true, statusPurpose});
  const {
    result, error: err, statusCode
  } = await setStatusList.post({json: body});
  should.not.exist(err);
  should.exist(result);
  statusCode.should.equal(200);
  const publishSlcEndpoint = `${statusInfo.statusListCredential}/publish`;
  // force publication of new SLC
  const {
    result: result2, error: err2, statusCode: statusCode2
  } = await publishStatusList.post({url: publishSlcEndpoint, json: {}});
  should.not.exist(err2);
  should.exist(result2);
  statusCode2.should.equal(204);
  // get the status of the VC
  const {status} = await getCredentialStatus({verifiableCredential: vc});
  status.should.equal(true);
  return vc;
}

export async function decodeSl({encodedList}) {
  encodedList[0].should.equal('u',
    'Expected encodedList to be a Multibase-encoded ' +
    'base64url value.'
  );
  let decoded;
  let error;
  try {
    // Uncompress encodedList
    decoded = ungzip(base64url.decode(encodedList.substring(1)));
  } catch(e) {
    error = e;
  }
  should.not.exist(error,
    'Expected encodedList to be a Multibase-encoded base64url' +
    'representation of a GZIP-compressed bitstring.');
  return decoded;
}
