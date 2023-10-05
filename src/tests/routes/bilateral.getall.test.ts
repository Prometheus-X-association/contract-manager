import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { IBilateralContractDB } from 'interfaces/contract.interface';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import BilateralContract from 'models/bilateral.model';
import bilateralContractService from 'services/bilateral.service';
import { config } from 'config/config';

const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/bilateral/contract/';
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
  const didPartyB: string = 'DID:partyBFakeTokenForGetAllRoute';

  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    await BilateralContract.deleteMany({});
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
    const negotiatorDataA: { did: string } = {
      did: didPartyA,
    };
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}negociator/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(negotiatorDataA);
    // Add the party B as negotiator for the signed contract
    const negotiatorDataB: { did: string } = {
      did: didPartyB,
    };
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}negociator/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(negotiatorDataB);

    // Define the signature data for party A
    // Then send a PUT request to sign the contract for party A
    const signatureDataPartyA: BilateralContractSignature = {
      did: didPartyA,
      party: 'partyA',
      value: 'partyASignature1',
    };
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyA);

    // Define the signature data for party B
    // Then send a PUT request to sign the contract for party B
    const signatureDataPartyB: BilateralContractSignature = {
      did: didPartyB,
      party: 'partyB',
      value: 'partyBSignature',
    };
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${signedContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(signatureDataPartyB);

    // Create a third contract
    const thirdContractData = {};
    const responseThird = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(thirdContractData);
    thirdContractId = responseThird.body._id;

    // Add the party A as negotiator for the third contract
    await supertest(app.router)
      .put(`${API_ROUTE_BASE}negociator/${thirdContractId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(negotiatorDataA);

    // Create an unsigned contract
    const unsignedContractData = {};
    const responseUnsigned = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(unsignedContractData);
    unsignedContractId = responseUnsigned.body._id;
  });

  after(async () => {
    // Delete the created contracts
    try {
      await bilateralContractService.deleteContract(signedContractId);
      await bilateralContractService.deleteContract(unsignedContractId);
      await bilateralContractService.deleteContract(thirdContractId);
    } catch (error: any) {
      console.log(error);
    }
    // Stop the test server
    server.close();
    console.log('Test server stopped.');
  });

  // Test suite for the route to get all contracts
  describe('Routes for Contract API - GetAllContracts', () => {
    // Test case for getting all contracts without filters
    //    /bilateral/contract/all/
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
        thirdContractId,
      ]);
    });

    // Test case for getting contracts with a specific DID in participants
    //    /bilateral/contract/for/participantFakeTokenDID or
    //    /bilateral/contract/for/participantFakeTokenDID?isParticipant=true
    it('should return contracts where DID is in participants', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}for/${did}?isParticipant=${isParticipant}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Two contracts should be returned
      expect(contracts.length).to.equal(2);
      expect(contracts.map((contract) => contract._id)).to.include.members([
        signedContractId,
        thirdContractId,
      ]);
    });

    // Test case for getting contracts where DID in the same time in signatures and participants
    //    /bilateral/contract/for/participantFakeTokenDID?hasSigned=true
    it('should return contracts where DID in the same time in signatures and participants', async () => {
      const did = didPartyA;
      const hasSigned = true;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}for/${did}?hasSigned=${hasSigned}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Only the signed contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(signedContractId);
    });

    // Test case for getting contracts where DID is not a participant nor in signatures
    //    /bilateral/contract/for/participantFakeTokenDID?isParticipant=false ou
    //    /bilateral/contract/for/participantFakeTokenDID?isParticipant=false&hasSigned=false
    it('should return contracts where DID is not a participant nor in signatures', async () => {
      const did = didPartyA;
      const isParticipant = false;
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}for/${did}?isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Both contracts (signed and unsigned) should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(unsignedContractId);
    });

    // Test case for getting contracts where DID is in participants but not in signatures
    //    /bilateral/contract/for/participantFakeTokenDID?isParticipant=true&hasSigned=false
    it('should return contracts where DID is in participants but not in signatures', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}for/${did}?isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Only the unsigned contract should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(thirdContractId);
    });

    // Test case for getting contracts where DID is not in signatures with hasSigned equal false
    //    /bilateral/contract/for/participantFakeTokenDID?hasSigned=false
    it('should return contracts where DID is not in signatures with hasSigned equal false', async () => {
      const did = didPartyA;
      const hasSigned = false;
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}for/${did}?hasSigned=${hasSigned}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Two contracts should be returned
      expect(contracts.length).to.equal(2);
      expect(contracts.map((contract) => contract._id)).to.include.members([
        unsignedContractId,
        thirdContractId,
      ]);
    });

    // Test case for getting contracts where DID is in participants and in signatures
    //    /bilateral/contract/for/participantFakeTokenDID?hasSigned=true ou
    //    /bilateral/contract/for/participantFakeTokenDID?isParticipant=true&hasSigned=true
    it('should return contracts where DID is in participants and in signatures', async () => {
      const did = didPartyA;
      const isParticipant = true;
      const hasSigned = true;
      const response = await supertest(app.router)
        .get(
          `${API_ROUTE_BASE}for/${did}?isParticipant=${isParticipant}&hasSigned=${hasSigned}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: IBilateralContractDB[] = response.body.contracts;
      // Two contracts (signed and unsigned) should be returned
      expect(contracts.length).to.equal(1);
      expect(contracts[0]._id).to.equal(signedContractId);
    });

    // Test case to retrieve the list of contracts with status 'signed'
    it('should return contracts with status "signed"', async () => {
      // Define the status to filter by
      const status = 'signed';
      const response = await supertest(app.router)
        .get(`${API_ROUTE_BASE}status/${status}`)
        .set('Authorization', `Bearer ${authToken}`);
      _logObject(response.body);
      expect(response.status).to.equal(200);
      const contracts: Array<any> = response.body.contracts;
      expect(contracts.length).to.equal(1);
      // Ensure that the signed contract is present in the list
      expect(contracts.some((contract) => contract._id === signedContractId)).to
        .be.true;
    });
  });
});
