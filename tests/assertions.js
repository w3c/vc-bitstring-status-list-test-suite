/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');

const should = chai.should();

/**
 * Tests the properties of a credential.
 *
 * @param {object} options - The options to use.
 * @param {object} options.credential - A VC issued from an issuer.
 *
 * @returns {undefined} Just returns on success.
 */
const testCredential = ({credential}) => {
  should.exist(credential, 'expected credential to exist');
  credential.should.be.an('object');
  credential.should.have.property('@context');
  credential['@context'].should.include.members([
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ]);
  credential.should.have.property('type');
  credential.type.should.be.an('array');
  credential.type.should.include.members([
    'VerifiableCredential'
  ]);
  credential.should.have.property('id');
  credential.id.should.be.a('string');
  credential.should.have.property('credentialSubject');
  credential.credentialSubject.should.be.an('object');
  credential.should.have.property('issuanceDate');
  credential.issuanceDate.should.be.a('string');
  credential.should.have.property('expirationDate');
  credential.expirationDate.should.be.a('string');
  credential.should.have.property('issuer');
  const issuerType = typeof(credential.issuer);
  issuerType.should.be.oneOf(['string', 'object']);
  if(issuerType === 'object') {
    should.exist(credential.issuer.id,
      'Expected issuer object to have property id');
    credential.issuer.id.should.be.an('object');
  }
  credential.should.have.property('proof');
  credential.proof.should.be.an('object');
  credential.should.have.property('credentialStatus');
  credential.credentialStatus.should.be.an('object');
  credential.credentialStatus.should.have.keys([
    'id',
    'type',
    'statusListCredential',
    'statusListIndex',
    'statusPurpose'
  ]);
  credential.credentialStatus.type.should.equal('StatusList2021Entry');
};

const testSlCredential = ({slCredential}) => {
  should.exist(slCredential, 'expected credential to exist');
  slCredential.should.be.an('object');
  slCredential.should.have.property('@context');
  slCredential['@context'].should.include.members([
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ]);
  slCredential.should.have.property('type');
  slCredential.type.should.be.an('array');
  slCredential.type.should.include.members(
    ['VerifiableCredential', 'StatusList2021Credential']);
  slCredential.should.have.property('id');
  slCredential.id.should.be.a('string');
  slCredential.should.have.property('credentialSubject');
  const {credentialSubject} = slCredential;
  credentialSubject.should.have.keys(['id', 'type', 'encodedList']);
  credentialSubject.id.should.be.a('string');
  credentialSubject.encodedList.should.be.a('string');
  credentialSubject.type.should.be.a('string');
  credentialSubject.type.should.eql('StatusList2021');
  slCredential.should.have.property('issuer');
  const issuerType = typeof(slCredential.issuer);
  issuerType.should.be.oneOf(['string', 'object']);
  if(issuerType === 'object') {
    should.exist(slCredential.issuer.id,
      'Expected issuer object to have property id');
    slCredential.issuer.id.should.be.an('object');
  }
  slCredential.should.have.property('issuanceDate');
  slCredential.issuanceDate.should.be.a('string');
  slCredential.should.have.property('proof');
  slCredential.proof.should.be.an('object');
};

module.exports = {testCredential, testSlCredential};
