/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as vc from '@digitalbazaar/vc';
import documentLoader from './documentLoader.js';
import {Ed25519Signature2020} from '@digitalbazaar/ed25519-signature-2020';
import {getDiDKey, writeJSON} from './helpers.js';
import {join} from 'path';
import {klona} from 'klona';
import statusListCtx from '@digitalbazaar/vc-status-list-context';


const credentialsPath = join(process.cwd(), 'static-vcs');
const VC_SL_CONTEXT_URL = statusListCtx.constants.CONTEXT_URL_V1;

const encodedList100k =
  'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQsvoAAAAAAAAAAAAAAAAP4GcwM92tQwAAA';

// this will generate the signed VCs for the test
const main = async () => {
  console.log('generating vcs');
  const {methodFor} = await getDiDKey();
  const key = methodFor({purpose: 'capabilityInvocation'});
  const suite = new Ed25519Signature2020({key});
  const PORT = 9001;
  const BASE_URL = `https://localhost:${PORT}`;

  let slCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      VC_SL_CONTEXT_URL
    ],
    id: `${BASE_URL}/status/1`,
    issuer: 'did:key:z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T53b',
    issuanceDate: '2022-01-10T04:24:12.164Z',
    type: ['VerifiableCredential', 'StatusList2021Credential'],
    credentialSubject: {
      id: `${BASE_URL}/status/1#list`,
      type: 'RevocationList2021',
      encodedList: encodedList100k
    }
  };
  // sign slCredential
  slCredential = await vc.issue({
    credential: slCredential,
    documentLoader,
    suite
  });

  const unsignedCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      VC_SL_CONTEXT_URL,
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: 'urn:uuid:a0418a78-7924-11ea-8a23-10bf48838a41',
    type: ['VerifiableCredential', 'example:TestCredential'],
    credentialSubject: {
      id: 'urn:uuid:4886029a-7925-11ea-9274-10bf48838a41',
      'example:test': 'foo'
    },
    credentialStatus: {
      id: `${BASE_URL}/status/1#67342`,
      type: 'RevocationList2021Status',
      statusListIndex: '67342',
      statusListCredential: slCredential.id
    },
    issuer: slCredential.issuer,
  };

  const {path, signedVc: data} = await _validVc(unsignedCredential, suite);
  const validVc = data;
  const vcs = await Promise.all([
    _invalidCredentialStatusType(validVc),
    _invalidStatusListCredentialId(unsignedCredential, suite),
  ]);
  console.log('writing vcs to /credentials');

  // write them to disk
  await Promise.all([
    ...vcs,
    // add the valid vc to the list
    {path, data}
  ].map(writeJSON));
  console.log('vcs generated');
};

async function _invalidStatusListCredentialId(unsignedCredential, suite) {
  const copyUnsignedCredential = klona(unsignedCredential);
  copyUnsignedCredential.credentialStatus.statusListCredential = 'invalid-id';
  const signedVc = await vc.issue({
    credential: copyUnsignedCredential,
    documentLoader,
    suite
  });
  return {
    path: `${credentialsPath}/invalidStatusListCredentialId.json`,
    data: signedVc
  };
}

async function _invalidCredentialStatusType(validVc) {
  const vc = klona(validVc);
  vc.credentialStatus.type = 'invalid-type';
  return {
    path: `${credentialsPath}/invalidCredentialStatusType.json`,
    data: vc,
  };
}

async function _validVc(unsignedCredential, suite) {
  const copyUnsignedCredential = klona(unsignedCredential);
  const signedVc = await vc.issue({
    credential: copyUnsignedCredential,
    documentLoader,
    suite
  });

  return {path: `${credentialsPath}/validVc.json`, signedVc};
}

// run main by calling node ./vc-generator
main();
