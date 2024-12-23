// Ecosystem Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { ContractMember } from 'interfaces/schemas.interface';
import { ContractService } from 'services/contract.service';
import ContractModel from 'models/contract.model';
import { config } from 'config/config';
import { IContractDB } from 'interfaces/contract.interface';
import { Model } from 'mongoose';

let authTokenCookie: any;
const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contracts/';
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
//let Contract: Model<IContractDB>;
let createdContractId: string;
describe('contract agent.', function () {
  this.timeout(10000);

  let server: any;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    // Contract = await ContractModel.getModel();

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];
  });

  after(async function () {
    const contractService = await ContractService.getInstance();
    try {
      await contractService.deleteContract(createdContractId);
    } catch (error: any) {
      console.log(error);
    }
    server.close();
    console.log('Test server stopped.');
  });

  it('should create...', async function () {
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
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Cookie', authTokenCookie)
      .send({ contract, role: 'ecosystem' });
    _logObject(`BODY:\n${JSON.stringify(response.body)}`);
    expect(response.status).to.equal(201);

    expect(response.body).to.have.property('_id');
    createdContractId = response.body._id;
  });

  it('should update...', async function () {
    const updatedContractData = {
      updated: true,
    };
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedContractData);
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });
});
