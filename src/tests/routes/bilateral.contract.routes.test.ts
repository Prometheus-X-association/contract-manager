// Bilateral Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { BilateralContractSignature } from 'interfaces/schemas.interface';

const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/bilateral/contract/';
beforeEach(() => {
  console.log('\n');
});
describe('Routes for Bilateral Contract API', () => {
  let server: any;
  let authToken: string;
  before(async () => {
    server = await app.startServer();
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    const authResponse = await supertest(app.router).get('/user/login');
    expect(authResponse.status).to.equal(200);
    authToken = authResponse.body.token;
  });

  after(() => {
    server.close();
    console.log('Test server stopped.');
  });

  // Variable to store the ID of the created contract
  let createdContractId: String;
  // Test case: Create a new contract
  it('should create a new bilateral contract', async () => {
    const contractData = {
      '@context': 'context',
      '@type': 'type',
      '@id': 'id',
      permission: [
        {
          '@type': 'Offer',
        },
      ],
    };
    // Send a POST request to create the contract
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(contractData);
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
      .set('Authorization', `Bearer ${authToken}`);
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
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedContractData);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has the expected 'message'
    expect(response.body).to.have.property('_id');
  });

  // Test case: Sign a contract for party A twice and party B once
  it('should sign a bilateral contract for party A twice, then party B once, and finally set signed to true', async () => {
    // Define the signature data for party A for a first time
    const signatureDataPartyA1: BilateralContractSignature = {
      party: 'partyA',
      value: 'partyASignature1',
    };
    // Send a PUT request to sign the contract for party A the first time
    const responsePartyA1 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyA1);
    // Check if the response status for party A's first signature is OK (200)
    expect(responsePartyA1.status).to.equal(200);
    // Define the signature data for party A for a second time
    const signatureDataPartyA2: BilateralContractSignature = {
      party: 'partyA',
      value: 'partyASignature2',
    };
    // Send a PUT request to sign the contract for party A the second time
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyA2);
    // Define the signature data for party B
    const signatureDataPartyB: BilateralContractSignature = {
      party: 'partyB',
      value: 'partyBSignature',
    };
    // Send a PUT request to sign the contract for party B
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyB);
    // Check if the response status is OK (200)
    expect(response.status).to.equal(200);
    // Check if the response contains the updated contract with the signature
    expect(response.body).to.have.property('signatures');
    const signatures = response.body.signatures;
    // Check if party A's second signature exists in the updated contract
    const partyASignature2 = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyA' && signature.value === 'partyASignature2',
    );
    // Check if party B's signature exists in the updated contract
    const partyBSignature = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyB' && signature.value === 'partyBSignature',
    );
    // Check if party A's first signature does NOT exist in the updated contract
    const partyASignature1 = signatures.find(
      (signature: BilateralContractSignature) =>
        signature.party === 'partyA' && signature.value === 'partyASignature1',
    );
    // Check if both of party A's second signature and party B's signature exist
    expect(partyASignature2).to.exist;
    expect(partyBSignature).to.exist;
    // Check if party A's first signature does NOT exist
    expect(partyASignature1).to.not.exist;
    // Check if the 'signed' field is set to true
    expect(response.body.signed).to.equal(true);
  });

  // Test case: Try to add a third participant and expect an error
  it('should return an error when trying to add a third participant', async () => {
    // Define the signature data for party C
    const signatureDataPartyC: BilateralContractSignature = {
      party: 'partyC',
      value: 'partyCSignature',
    };
    // Send a PUT request to sign the contract for party C
    const responsePartyC = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyC);
    // Check if the response status is not OK (expecting an error)
    expect(responsePartyC.status).to.not.equal(200);
    // Check if the response contains an error message
    // indicating that a third participant is not allowed
    expect(responsePartyC.body).to.have.property('error');
    expect(responsePartyC.body.message).to.equal(
      'Cannot add a third participant.',
    );
  });

  // Test case: Delete a contract by ID
  it('should delete a bilateral contract by ID', async () => {
    // Send a DELETE request to delete the contract by its ID
    const response = await supertest(app.router)
      .delete(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has the expected 'message'
    expect(response.body).to.have.property(
      'message',
      'Contract deleted successfully.',
    );
  });
});
