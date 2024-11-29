// Bilateral Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import bilateralContractService from 'services/bilateral.service';
import BilateralContract from 'models/bilateral.model';
import { config } from 'config/config';

let authTokenCookie: any;
const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/bilaterals/';
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
describe('CRUD test cases for Bilateral Contracts.', () => {
  let server: any;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    await BilateralContract.deleteMany({});

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];
  });

  after(async () => {
    try {
      await bilateralContractService.deleteContract(createdContractId);
    } catch (error: any) {
      console.log(error);
    }
    server.close();
    console.log('Test server stopped.');
  });

  // Variable to store the ID of the created contract
  let createdContractId: string;
  // Test case: Create a new contract
  it('should create a new bilateral contract', async () => {
    const contractData = {
      dataProvider: 'provider',
      dataConsumer: 'consumer',
      serviceOffering: 'offering',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target/policy',
        },
        {
          action: 'use',
          target: 'http://contract-target/service',
        },
      ],
    };
    // Send a POST request to create the contract
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Cookie', authTokenCookie)
      .send({ contract: contractData });
    //
    _logObject(response.body);
    // Check if the response status is 201 (Created)
    expect(response.status).to.equal(201);
    // Check if the response has a 'id' property
    expect(response.body).to.have.property('_id');
    // Store the contract ID for later use (for update and delete tests)
    createdContractId = response.body._id;
  });

  // Test case: Get a contract by ID
  it('should get a bilateral contract by ID', async () => {
    // Send a GET request to retrieve the contract by its ID
    const response = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie);
    //
    _logObject(response.body);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has a 'id' property
    expect(response.body).to.have.property('_id');
  });

  // Test case: Update a contract by ID
  it('should update a bilateral contract by ID', async () => {
    const updatedContractData = {
      updated: true,
    };
    // Send a PUT request to update the contract by its ID
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedContractData);
    //
    _logObject(response.body);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has the expected 'message'
    expect(response.body).to.have.property('_id');
  });

  // Test case: Sign a contract for party A twice and party B once
  it('should sign a bilateral contract for party A twice, then party B once, and finally set signed to true', async () => {
    // Define the DID for each party
    const didPartyA: string = 'did:partyA';
    const didPartyB: string = 'did:partyB';

    // Define the signature data for party A for the first time
    const signatureDataPartyA1: BilateralContractSignature = {
      did: didPartyA,
      party: 'partyA',
      value: 'partyASignature1',
    };

    // Send a PUT request to sign the contract for party A the first time
    const responsePartyA1 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA1);
    //
    _logObject(responsePartyA1.body);
    // Check if the response status for party A's first signature is OK (200)
    expect(responsePartyA1.status).to.equal(200);

    // Define the signature data for party A for the second time
    const signatureDataPartyA2: BilateralContractSignature = {
      did: didPartyA,
      party: 'partyA',
      value: 'partyASignature2',
    };

    // Send a PUT request to sign the contract for party A the second time
    const responsePartyA2 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA2);
    //
    _logObject(responsePartyA2.body);
    // Define the signature data for party B
    const signatureDataPartyB: BilateralContractSignature = {
      did: didPartyB,
      party: 'partyB',
      value: 'partyBSignature',
    };

    // Send a PUT request to sign the contract for party B
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyB);
    //
    _logObject(response.body);
    // Check if the response status is OK (200)
    expect(response.status).to.equal(200);
    // Check if the response contains the updated contract with the signature
    expect(response.body).to.have.property('signatures');
    const signatures = response.body.signatures;
    // Check if party A's second signature exists in the updated contract
    const partyASignature2 = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyA' &&
        signature.value === 'partyASignature2' &&
        signature.did === didPartyA,
    );
    // Check if party B's signature exists in the updated contract
    const partyBSignature = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyB' &&
        signature.value === 'partyBSignature' &&
        signature.did === didPartyB,
    );
    // Check if party A's first signature does NOT exist in the updated contract
    const partyASignature1 = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyA' &&
        signature.value === 'partyASignature1' &&
        signature.did === didPartyA,
    );
    // Check if both of party A's second signature and party B's signature exist
    expect(partyASignature2).to.exist;
    expect(partyBSignature).to.exist;
    // Check if party A's first signature does NOT exist
    expect(partyASignature1).to.not.exist;
    // Check if the 'status' field is set to 'signed'
    expect(response.body.status).to.equal('signed');
  });

  // Test case: Try to add a third participant and expect an error
  it('should return an error when trying to add a third participant', async () => {
    // Define the DID for party C
    const didPartyC: string = 'did:partyC';
    // Define the signature data for party C
    const signatureDataPartyC: BilateralContractSignature = {
      did: didPartyC,
      party: 'partyC',
      value: 'partyCSignature',
    };
    // Send a PUT request to sign the contract for party C
    const responsePartyC = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyC);
    //
    _logObject(responsePartyC.body);
    // Check if the response status is not OK (expecting an error)
    expect(responsePartyC.status).to.not.equal(200);
    // Check if the response contains an error message
    // indicating that a third participant is not allowed
    expect(responsePartyC.body).to.have.property('error');
    expect(responsePartyC.body.message).to.equal(
      'Cannot add a third participant.',
    );
  });

  // Test case: Check if data is exploitable
  it('should check whether a specific resource is exploitable through an established contract', async () => {
    const data = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Set',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target',
        },
      ],
    };
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}check-exploitability/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(data);
    //
    _logObject(response.body);
    //
    expect(response.body.authorised).to.equal(true);
  });

  // Test case: Revoke a signature
  it('should revoke a signature and move it to revokedSignatures', async () => {
    // Define the DID for party B
    const didPartyB: string = 'did:partyB';
    // Revoke the signature for party B
    const response = await supertest(app.router)
      .delete(`${API_ROUTE_BASE}sign/revoke/${createdContractId}/${didPartyB}`)
      .set('Cookie', authTokenCookie);
    //
    _logObject(response.body);
    // Check if the response status is OK (200)
    expect(response.status).to.equal(200);
    // Check if the response contains the updated contract with revokedSignatures
    expect(response.body).to.have.property('revokedSignatures');
    const revokedSignatures = response.body.revokedSignatures;
    // Check if the revoked signature exists in the revokedSignatures array
    const partyBRevokedSignature = revokedSignatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyB' &&
        signature.value === 'partyBSignature' &&
        signature.did === didPartyB,
    );
    // Check if the revoked signature exists in revokedSignatures
    expect(partyBRevokedSignature).to.exist;
    // Check if the revoked signature does NOT exist in signatures
    const partyBSignatureInSignatures = response.body.signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyB' &&
        signature.value === 'partyBSignature' &&
        signature.did === didPartyB,
    );
    expect(partyBSignatureInSignatures).to.not.exist;
    // Check if the 'status' field is set to 'revoked'
    expect(response.body.status).to.equal('revoked');
  });

  it('should remove a bilateral contract using a service offering ID', async () => {
    // Reuse the service offering ID from the contract created in the first test
    const serviceOfferingId = 'offering';

    // Should throw an error when failing
    await bilateralContractService.deleteManyFromOffering(serviceOfferingId);

    expect(true).to.equal(true);
  });
});
