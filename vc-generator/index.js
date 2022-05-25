/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {createValidVc} = require('../tests/helpers.js');
const {filterImplementations} = require('vc-api-test-suite-implementations');
const {join} = require('path');
const {klona} = require('klona');
const {writeJSON} = require('./helpers');

const credentialsPath = join(process.cwd(), 'static-vcs');

// this will generate the signed VCs for the verifier tests
const main = async () => {
  const {
    path1,
    path2,
    validVcForRevocation,
    validVcForSuspension
  } = await _validVcs();

  const vcs = [
    _invalidCredentialStatusType(validVcForRevocation),
    _invalidStatusListCredentialId(validVcForRevocation),
  ];
  console.log('writing vcs to /credentials');

  // write them to disk
  await Promise.all([
    ...vcs,
    // add the valid vc for revocation to the list
    {path: path1, data: validVcForRevocation},
    // add the valid vc for revocation to the list
    {path: path2, data: validVcForSuspension}
  ].map(writeJSON));
  console.log('vcs generated');

  function _invalidStatusListCredentialId(validVc) {
    const copyVc = klona(validVc);
    copyVc.credentialStatus.statusListCredential = 'invalid-id';
    return {
      path: `${credentialsPath}/invalidStatusListCredentialId.json`,
      data: copyVc
    };
  }

  function _invalidCredentialStatusType(validVc) {
    const copyVc = klona(validVc);
    copyVc.credentialStatus.type = 'invalid-type';
    return {
      path: `${credentialsPath}/invalidCredentialStatusType.json`,
      data: copyVc
    };
  }

  async function _validVcs() {
    // get a VC issued by DB
    const {match} = filterImplementations({filter: ({value}) => {
      return value.settings.name === 'Digital Bazaar';
    }});
    const {issuers} = match.get('Digital Bazaar');
    const issuer1 = issuers.find(
      issuer => issuer.tags.has('Revocation'));
    const issuer2 = issuers.find(
      issuer => issuer.tags.has('Suspension'));
    const credential1 = createValidVc({issuer: issuer1});
    const credential2 = createValidVc({issuer: issuer2});
    const {data: validVcForRevocation} = await issuer1.issue(
      {body: {credential: credential1}});
    const {data: validVcForSuspension} = await issuer2.issue(
      {body: {credential: credential2}});
    return {
      path1: `${credentialsPath}/validVcForRevocation.json`,
      validVcForRevocation,
      path2: `${credentialsPath}/validVcForSuspension.json`,
      validVcForSuspension
    };
  }
};

main();
