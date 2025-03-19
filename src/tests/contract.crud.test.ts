// Ecosystem Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { ContractMember } from 'interfaces/schemas.interface';
import { ContractService } from 'services/contract.service';
import Contract from 'models/contract.model';
import { config } from 'config/config';

let authTokenCookie: any;
const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contracts/';
describe('CRUD test cases for Contracts (Dataspace use cases).', () => {
  let server: any;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    Contract.deleteMany({});

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];
  });

  after(async () => {
    const contractService = await ContractService.getInstance();
    try {
      await contractService.deleteContract(createdContractId);
    } catch (error: any) {
      console.log(error);
    }
    server.close();
    console.log('Test server stopped.');
  });

  // Variable to store the ID of the created contract
  let createdContractId: string;
  // Test case: Create a new contract
  it('should create a new contract', async () => {
    const contract = {
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
      .send({ contract, role: 'ecosystem' });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');
    // Store the contract ID for later use (for update and delete tests)
    createdContractId = response.body._id;
  });

  // Test case: Get a contract by ID
  it('should get a contract by ID', async () => {
    // Send a GET request to retrieve the contract by its ID
    const response = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie);
    expect(response.status).to.equal(200);
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
      .set('Cookie', authTokenCookie)
      .send(updatedContractData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });

  // Test case: Sign a contract for party A twice, party B once, the orchestrator, and set signed to true
  it('should sign a contract for party A twice, party B once, the orchestrator, and set signed to true', async () => {
    // Define the DID for each party
    const didPartyA: string = 'did:partyA';
    const didPartyB: string = 'did:partyB';
    const didOrchestrator: string = 'did:orchestrator';

    // Define the signature data for the orchestrator
    const signatureDataOrchestrator: ContractMember = {
      participant: didOrchestrator,
      role: 'orchestrator',
      signature: 'orchestratorSignature',
    };

    // Send a PUT request to sign the contract for the orchestrator
    const responseOrchestrator = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataOrchestrator);
    expect(responseOrchestrator.status).to.equal(200);

    // Define the signature data for party A for the first time
    const signatureDataPartyA1: ContractMember = {
      participant: didPartyA,
      role: 'partyA',
      signature: 'partyASignature1',
    };

    // Send a PUT request to sign the contract for party A the first time
    const responsePartyA1 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA1);
    expect(responsePartyA1.status).to.equal(200);

    // Define the signature data for party A for the second time
    const signatureDataPartyA2: ContractMember = {
      participant: didPartyA,
      role: 'partyA',
      signature: 'partyASignature2',
    };

    // Send a PUT request to sign the contract for party A the second time
    const responsePartyA2 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA2);
    // Define the signature data for party B
    const signatureDataPartyB: ContractMember = {
      participant: didPartyB,
      role: 'partyB',
      signature: 'partyBSignature',
    };

    // Send a PUT request to sign the contract for party B
    const responsePartyB = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyB);
    expect(responsePartyB.status).to.equal(200);

    // Check if the response contains the updated contract with the signatures
    expect(responsePartyB.body).to.have.property('members');
    const members = responsePartyB.body.members;

    // Check if party A's second signature exists in the updated contract
    const partyASignature2 = members.find(
      (member: ContractMember) =>
        member.role === 'partyA' && member.signature === 'partyASignature2',
    );

    // Check if party B's signature exists in the updated contract
    const partyBSignature = members.find(
      (member: ContractMember) =>
        member.role === 'partyB' && member.signature === 'partyBSignature',
    );

    // Check if the orchestrator's signature exists in the updated contract
    const orchestratorSignature = members.find(
      (member: ContractMember) =>
        member.role === 'orchestrator' &&
        member.signature === 'orchestratorSignature',
    );

    // Check if both party A's second signature, party B's signature,
    // and orchestrator's signature do exist
    expect(partyASignature2).to.exist;
    expect(partyBSignature).to.exist;
    expect(orchestratorSignature).to.exist;

    // Check if the 'status' field is set to 'signed'
    expect(responsePartyB.body.status).to.equal('signed');
  });

  // Test case: Revoke a signature
  it('should revoke a signature and move it to revokedMembers', async () => {
    // Define the DID for party B
    const didPartyB: string = 'did:partyB';
    // Revoke the signature for party B
    const response = await supertest(app.router)
      .delete(`${API_ROUTE_BASE}sign/revoke/${createdContractId}/${didPartyB}`)
      .set('Cookie', authTokenCookie);
    //
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('revokedMembers');
    const revokedMembers = response.body.revokedMembers;
    // Check if the revoked signature exists in the revokedSignatures array
    const partyBRevokedSignature = revokedMembers.find(
      (member: ContractMember) =>
        member.role === 'partyB' &&
        member.signature === 'partyBSignature' &&
        member.participant === didPartyB,
    );
    // Check if the revoked signature exists in revokedMembers
    expect(partyBRevokedSignature).to.exist;
    // Check if the revoked signature does NOT exist in signatures
    const partyBSignatureInSignatures = response.body.members.find(
      (member: ContractMember) =>
        member.role === 'partyB' &&
        member.signature === 'partyBSignature' &&
        member.participant === didPartyB,
    );
    expect(partyBSignatureInSignatures).to.not.exist;
    expect(response.body.status).to.equal('revoked');
  });
});
