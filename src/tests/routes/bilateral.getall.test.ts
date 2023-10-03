import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { IBilateralContractDB } from 'interfaces/contract.interface';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import bilateralContractService from 'services/bilateral.service';

const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contract/';
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};

// Test suite for the route to get all contracts with filters
describe('Routes for Contract API - GetAllContractsFor', () => {
  let server: any;
  let authToken: string;
  let signedContractId: string;
  let unsignedContractId: string;
  let thirdContractId: string;
  const didPartyA: string = 'DID:partyAFakeTokenForGetAllRoute';

  before(async () => {
    server = await app.startServer();
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    // Get authentication token
    const authResponse = await supertest(app.router).get('/user/login');
    expect(authResponse.status).to.equal(200);
    authToken = authResponse.body.token;

    // Create a signed contract
    const signedContractData = {};
    const responseSigned = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signedContractData);
    signedContractId = responseSigned.body._id;

    // Add the party A as negotiator for the signed contract
    const negotiatorData: { did: string } = {
      did: didPartyA,
    };
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}negociator/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(negotiatorData);

    // Define the signature data for party A
    const signatureDataPartyA1: BilateralContractSignature = {
      did: didPartyA,
      party: 'partyA',
      value: 'partyASignature1',
    };

    // Send a PUT request to sign the contract for party A
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyA1);

    // Create a third contract
    const thirdContractData = {};
    const responseThird = await supertest(app.router)
      .post('/contract')
      .set('Authorization', `Bearer ${authToken}`)
      .send(thirdContractData);
    thirdContractId = responseThird.body._id;

    // Add the party A as negotiator for the third contract
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}negociator/${thirdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(negotiatorData);

    // Create an unsigned contract
    const unsignedContractData = {};
    const responseUnsigned = await supertest(app.router)
      .post('/contract')
      .set('Authorization', `Bearer ${authToken}`)
      .send(unsignedContractData);
    unsignedContractId = responseUnsigned.body._id;
  });

  after(async () => {
    // Delete the created contracts
    try {
      await bilateralContractService.deleteContract(signedContractId);
      await bilateralContractService.deleteContract(unsignedContractId);
    } catch (error: any) {
      console.log(error);
    }
    // Stop the test server
    server.close();
    console.log('Test server stopped.');
  });

  // Test case for getting all contracts without filters
  //    /contract/all/
  describe(`GET ${API_ROUTE_BASE}all/`, () => {
    it('should return all contracts', async () => {
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}all/`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Compare with the IDs created at the beginning
      const contractIds = contracts.map((contract) => contract._id);
      expect(contractIds).to.include.members([
        signedContractId,
        unsignedContractId,
      ]);
    });

    // Test case for getting contracts with a specific DID in participants
    //    /contract/all/?did=participantFakeTokenDID or
    //    /contract/all/?did=participantFakeTokenDID&isParticipant=true
    it('should return contracts where DID is in participants', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}/all?did=${did}&isParticipant=${isParticipant}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Both contracts (signed and unsigned) should be returned
      expect(contracts.length).to.equal(2);
      expect(contracts.map((contract) => contract._id)).to.include.members([
        signedContractId,
        unsignedContractId,
      ]);
    });

    // Test case for getting contracts where DID is not in signatures when hasSigned is true
    //    /contract/all/?did=participantFakeTokenDID&hasSigned=true
    it('should return contracts where DID is not in signatures when hasSigned is true', async () => {
      const did = didPartyA;
      const hasSigned = true;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}/all?did=${did}&hasSigned=${hasSigned}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Only the signed contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(signedContractId);
    });

    // Test case for getting contracts where DID is not a participant nor in signatures
    //    /contract/all/?did=participantFakeTokenDID&isParticipant=false ou
    //    /contract/all/?did=participantFakeTokenDID&isParticipant=false&hasSigned=false
    it('should return contracts where DID is not a participant nor in signatures', async () => {
      const did = didPartyA;
      const isParticipant = false;
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}/all?did=${did}&isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Both contracts (signed and unsigned) should be returned
      expect(contracts.length).to.equal(2);
      expect(contracts.map((contract) => contract._id)).to.include.members([
        signedContractId,
        unsignedContractId,
      ]);
    });

    // Test case for getting contracts where DID is in participants but not in signatures
    //    /contract/all/?did=participantFakeTokenDID&isParticipant=true&hasSigned=false
    it('should return contracts where DID is in participants but not in signatures', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}/all?did=${did}&isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Only the unsigned contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(unsignedContractId);
    });

    // Test case for getting contracts where DID is in participants and in signatures
    //    /contract/all/?did=participantFakeTokenDID&hasSigned=true ou
    //    /contract/all/?did=participantFakeTokenDID&isParticipant=true&hasSigned=true
    it('should return contracts where DID is in participants and in signatures', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const hasSigned = true;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}/all?did=${did}&isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Only the signed contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(signedContractId);
    });
  });
});
