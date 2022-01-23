/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');

const should = chai.should();

/**
 * Tests the properties of a credential.
 *
 * @param {object} credential - A VC issued from an issuer.
 *
 * @returns {undefined} Just returns on success.
 */
const testCredential = credential => {
  should.exist(credential, 'expected credential to exist');
  credential.should.be.an('object');
  credential.should.have.property('@context');
  // NOTE: some issuers add a revocation list context to the types
  credential['@context'].should.include(
    'https://www.w3.org/2018/credentials/v1');
  credential.should.have.property('type');
  credential.type.should.eql([
    'VerifiableCredential',
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
  credential.issuer.should.be.a('string');
  credential.should.have.property('proof');
  credential.proof.should.be.an('object');
};

module.exports = {testCredential};
