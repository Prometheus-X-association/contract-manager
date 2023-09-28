// Ecosystem Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { ContractSignature } from 'interfaces/schemas.interface';

const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contract/';
beforeEach(() => {
  console.log('\n');
});
describe('Routes for Contract API', () => {
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

    const authResponse = await supertest(app.router)
      // .post('/user/login')
      .get('/user/login');
    /*
      .send({
        username: 'username',
        password: 'password',
      });
      */

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
  it('should create a new contract', async () => {
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
      .post('/contract')
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
  it('should get a contract by ID', async () => {
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
  it('should update a contract by ID', async () => {
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

  // Test case: Sign a contract for party A twice a party B once and the orchestrator
  it('should sign a contract for party A twice, party B once, the orchestrator, and set signed to true', async () => {
    // Define the signature data for party A for the first time
    const signatureDataPartyA1: ContractSignature = {
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
    // Define the signature data for party A for the second time
    const signatureDataPartyA2: ContractSignature = {
      party: 'partyA',
      value: 'partyASignature2',
    };
    // Send a PUT request to sign the contract for party A the second time
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyA2);
    // Define the signature data for party B
    const signatureDataPartyB: ContractSignature = {
      party: 'partyB',
      value: 'partyBSignature',
    };
    // Send a PUT request to sign the contract for party B
    const responsePartyB = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyB);

    // Check if the response status for party B's signature is OK (200)
    expect(responsePartyB.status).to.equal(200);
    // Define the signature data for the orchestrator
    const signatureDataOrchestrator: ContractSignature = {
      party: 'orchestrator',
      value: 'orchestratorSignature',
    };
    // Send a PUT request to sign the contract for the orchestrator
    const responseOrchestrator = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataOrchestrator);
    // Check if the response status for the orchestrator's signature is OK (200)
    expect(responseOrchestrator.status).to.equal(200);
    // Check if the response contains the updated contract with the signatures
    expect(responseOrchestrator.body).to.have.property('signatures');
    const signatures = responseOrchestrator.body.signatures;
    // Check if party A's second signature exists in the updated contract
    const partyASignature2 = signatures.find(
      (signature: ContractSignature) =>
        signature.party === 'partyA' && signature.value === 'partyASignature2',
    );
    // Check if party B's signature exists in the updated contract
    const partyBSignature = signatures.find(
      (signature: ContractSignature) =>
        signature.party === 'partyB' && signature.value === 'partyBSignature',
    );
    // Check if the orchestrator's signature exists in the updated contract
    const orchestratorSignature = signatures.find(
      (signature: ContractSignature) =>
        signature.party === 'orchestrator' &&
        signature.value === 'orchestratorSignature',
    );
    // Check if both of party A's second signature, party B's signature,
    // and orchestrator's signature do exist
    expect(partyASignature2).to.exist;
    expect(partyBSignature).to.exist;
    expect(orchestratorSignature).to.exist;
    // Check if the 'signed' field is set to true
    expect(responseOrchestrator.body.signed).to.equal(true);
  });

  // Test case: Delete a contract by ID
  it('should delete a contract by ID', async () => {
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
