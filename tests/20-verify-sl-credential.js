// const invalidCredentialStatusType =
//   require('../static-vcs/invalidCredentialStatusType.json');
// const invalidStatusListCredentialId =
//   require('../static-vcs/invalidStatusListCredentialId.json');
// const validVC = require('../static-vcs/validVC.json');

// describe('StatusList2021 Credentials (verify)', function() {
//   for(const [name, implementation] of implementations) {
//     describe(name, function() {
//       it.skip('MUST verify a valid "StatusList2021Credential"',
//         async function() {
//         // this tells the test report which cell
//         // in the interop matrix the result goes in
//           this.test.cell = {
//             columnId: name,
//             rowId: this.test.title
//           };
//           let response;
//           let err;
//           try {
//             response = await implementation.verify({
//               credential: validVC
//             });
//           } catch(e) {
//             err = e;
//           }
//           should.exist(response);
//           should.not.exist(err);
//         });
//       it('MUST fail to verify a VC with invalid ' +
//       '"credentialStatus.statusListCredential"', async function() {
//       // this tells the test report which cell
//       // in the interop matrix the result goes in
//         this.test.cell = {
//           columnId: verifier.name,
//           rowId: this.test.title
//         };
//         const implementation = new Implementation(verifier);
//         let response;
//         let err;
//         try {
//           response = await implementation.verify({
//             credential: invalidStatusListCredentialId
//           });
//         } catch(e) {
//           err = e;
//         }
//         should.not.exist(response);
//         should.exist(err);
//         should.exist(err.data);
//         // verifier returns 400
//         err.status.should.equal(400);
//         err.data.verified.should.equal(false);
//         const {check} = err.data.checks[0];
//         check.should.be.an('array');
//         check.should.include.members(['credentialStatus', 'proof']);
//       });
//       it('MUST fail to verify a VC with invalid "credentialStatus.type"',
//         async function() {
//         // this tells the test report which cell
//         // in the interop matrix the result goes in
//           this.test.cell = {
//             columnId: verifier.name,
//             rowId: this.test.title
//           };
//           const implementation = new Implementation(verifier);
//           let response;
//           let err;
//           try {
//             response = await implementation.verify({
//               credential: invalidCredentialStatusType
//             });
//           } catch(e) {
//             err = e;
//           }
//           should.not.exist(response);
//           should.exist(err);
//           should.exist(err.data);
//           // verifier returns 400
//           err.status.should.equal(400);
//           err.data.verified.should.equal(false);
//         });
//     });
//   }
// });
