/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';

const should = chai.should();

/**
 * Tests the properties of a credential.
 *
 * @param {object} credential - A VC issued from an issuer.
 *
 * @returns {undefined} Just returns on success.
 */
export const testCredential = credential => {
  should.exist(credential, 'expected credential to exist');
  credential.should.be.an('object');
  credential.should.have.property('@context');
  // NOTE: some issuers add a revocation list context to the types
  credential['@context'].should.include.members([
    'https://www.w3.org/2018/credentials/v1',
    // FIXME: Uncomment this once status-list is implemented in issuer
    // and verifier
    // 'https://w3id.org/vc/status-list/v1'
    'https://w3id.org/vc-revocation-list-2020/v1'
  ]);
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
  credential.should.have.property('credentialStatus');
  credential.credentialStatus.should.be.an('object');
  credential.credentialStatus.should.have.keys([
    'id',
    'type',
    // FIXME: once status list 2021 is implemented, change this to
    // statusListCredential
    'revocationListCredential',
    // FIXME: once status list 2021 is implemented, change this to
    // statusListIndex
    'revocationListIndex'
  ]);
  // FIXME: Update this to either equal `StatusList2021Status` or
  // `SuspensionList2021Status`
  credential.credentialStatus.type.should.equal('RevocationList2020Status');
};
