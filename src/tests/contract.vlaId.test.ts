// VLA ID field test cases for ecosystem Contracts
// Written test-first (red) — copy of contract.crud.test.ts pattern.
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { ContractService } from 'services/contract.service';
import ContractModel from 'models/contract.model';
import { config } from 'config/config';
import mongoose from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';

let authTokenCookie: any;
const SERVER_PORT = 9997;
const API_ROUTE_BASE = '/contracts/';
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
let Contract: mongoose.Model<IContractDB>;

describe('VLA ID field test cases for Contracts', () => {
  let server: any;
  let createdContractId: string;

  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    Contract = await ContractModel.getModel();
    // Await the deletion so the collection is guaranteed empty before the
    // first test runs. Without await, deleteMany runs in the background and
    // the first test may find stale documents from a previous test run.
    await Contract.deleteMany({});

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

  it('should create a new contract WITH vlaId and echo it back', async () => {
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target/policy',
        },
      ],
      vlaId: '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
    };
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Cookie', authTokenCookie)
      .send({ contract, role: 'ecosystem' });
    _logObject(response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');
    createdContractId = response.body._id;

    const getResponse = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie);
    _logObject(getResponse.body);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body).to.have.property('vlaId');
    expect(getResponse.body.vlaId).to.equal(
      '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
    );
  });

  it('should create a new contract WITHOUT vlaId (optional field)', async () => {
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
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
    _logObject(response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');

    const contractId2 = response.body._id;
    const getResponse = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${contractId2}`)
      .set('Cookie', authTokenCookie);
    _logObject(getResponse.body);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.vlaId).to.be.oneOf([undefined, null]);

    const contractService = await ContractService.getInstance();
    await contractService.deleteContract(contractId2);
  });

  it('should update a contract\'s vlaId', async () => {
    const newVlaId = '680c33f1-3f01-5f13-9d8c-2e7e385730a4';
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send({ vlaId: newVlaId });
    _logObject(response.body);
    expect(response.status).to.equal(200);

    const getResponse = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie);
    _logObject(getResponse.body);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body).to.have.property('vlaId');
    expect(getResponse.body.vlaId).to.equal(newVlaId);
  });
});