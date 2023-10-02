import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { IContractDB } from 'interfaces/contract.interface';

const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contract/all/';

// Test suite for the route to get all contracts with filters
describe('Routes for Contract API - GetAllContractsFor', () => {
  let server: any;
  let authToken: string;
  let signedContractId: string;
  let unsignedContractId: string;

  // Setup before running the tests
  before(async () => {
    server = await app.startServer();
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    // Get authentication token for testing
    const authResponse = await supertest(app.router).get('/user/login');
    expect(authResponse.status).to.equal(200);
    authToken = authResponse.body.token;

    // Create a signed contract
    const signedContractData = {
      '@context': 'context',
      '@type': 'type',
      '@id': 'id',
      permission: [
        {
          '@type': 'Offer',
        },
      ],
    };

    const responseSigned = await supertest(app.router)
      .post('/contract')
      .set('Authorization', `Bearer ${authToken}`)
      .send(signedContractData);

    signedContractId = responseSigned.body._id;

    // Create an unsigned contract
    const unsignedContractData = {
      '@context': 'context',
      '@type': 'type',
      '@id': 'id',
      permission: [
        {
          '@type': 'Offer',
        },
      ],
    };

    const responseUnsigned = await supertest(app.router)
      .post('/contract')
      .set('Authorization', `Bearer ${authToken}`)
      .send(unsignedContractData);

    unsignedContractId = responseUnsigned.body._id;
  });

  // Clean after running the tests
  after(async () => {
    // Delete the created contracts
    await supertest(app.router)
      .delete(`/contract/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`);

    await supertest(app.router)
      .delete(`/contract/${unsignedContractId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Stop the test server
    server.close();
    console.log('Test server stopped.');
  });

  // Test case for getting all contracts without filters
  describe('GET /contract/all/', () => {
    it('should return all contracts', async () => {
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      const contracts: IContractDB[] = response.body.contracts;

      // Compare with the IDs created at the beginning
      const contractIds = contracts.map((contract) => contract._id);
      expect(contractIds).to.include.members([
        signedContractId,
        unsignedContractId,
      ]);
    });

    // Test case for getting contracts with a specific DID in signatures
    it('should return contracts for a specific DID in signatures', async () => {
      const did = 'participantFakeTokenDID';
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}?did=${did}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      const contracts: IContractDB[] = response.body.contracts;

      // Only the signed contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(signedContractId);
    });

    // Test case for getting contracts where DID is not in signatures when hasSigned is false
    it('should return contracts where DID is not in signatures when hasSigned is false', async () => {
      const did = 'participantFakeTokenDID';
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}?did=${did}&hasSigned=${hasSigned}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      const contracts: IContractDB[] = response.body.contracts;

      // Only the unsigned contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(unsignedContractId);
    });
  });
});
