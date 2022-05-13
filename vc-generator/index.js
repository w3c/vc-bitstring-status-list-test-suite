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
  const {path, validVc} = await _validVc();
  const vcs = [
    _invalidCredentialStatusType(validVc),
    _invalidStatusListCredentialId(validVc),
  ];
  console.log('writing vcs to /credentials');

  // write them to disk
  await Promise.all([
    ...vcs,
    // add the valid vc to the list
    {path, data: validVc}
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

  async function _validVc() {
    // get a VC issued by DB
    const {match} = filterImplementations({filter: ({value}) => {
      return value.settings.name === 'Digital Bazaar';
    }});
    const {issuers} = match.get('Digital Bazaar');
    const issuer = issuers.find(
      issuer => issuer.tags.has('StatusList2021'));
    const {issuer: {id: issuerId}} = issuer;
    const credential = createValidVc({issuerId});
    const body = {credential};
    const {data: validVc} = await issuer.issue({body});
    return {path: `${credentialsPath}/validVc.json`, validVc};
  }
};
// run main by calling node ./vc-generator
main();
