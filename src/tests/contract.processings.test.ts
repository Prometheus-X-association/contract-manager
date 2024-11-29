import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from './utils/utils';

let cookie: any;
let contractId: any;
let processingId: any;
const SERVER_PORT = 9999;

describe('Create an ecosystem contract, test data processings related endpoints.', () => {
  let server: http.Server;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    await Contract.deleteMany({});
  });

  it('Retrieve the cookie after pinging the server', async () => {
    _logYellow('\n-Login the user');
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    _logGreen('Cookies:');
    _logObject(cookie);
    expect(authResponse.status).to.equal(200);
  });

  it('should generate an ecosystem contract', async () => {
    _logYellow('\n-Generate a contract with the following odrl policy');
    const contract = {
      ecosystem: 'ecosystem-id',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [],
      prohibition: [],
    };
    _logGreen('The odrl input contract:');
    _logObject(contract);
    const response = await supertest(app.router)
      .post('/contracts/')
      .set('Cookie', cookie)
      .send({ contract, role: 'ecosystem' });
    _logGreen('The contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('should add connector data processings to the contract', async () => {
    _logYellow('\n-Adding the following data processings');
    const processings = [
      {
        catalogId: "1",
        infrastructureServices: [
        { serviceOffering: 'connector-uri-a', participant: 'participant-a' },
        { serviceOffering: 'connector-uri-b', participant: 'participant-b' },
      ],
    }];
    _logGreen('The input processings:');
    _logObject(processings);
    const response = await supertest(app.router)
      .post(`/contracts/${contractId}/processings`)
      .set('Cookie', cookie)
      .send(processings);
    _logGreen('The processings inside the contract:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.be.an('object');
    expect(response.body[0]).to.have.property('catalogId', '1');
    expect(response.body[0]).to.have.property('infrastructureServices');
    expect(response.body[0]).to.have.property('catalogId');
    processingId = response.body[0].catalogId;
  });

  it('should get related processings', async () => {
    _logYellow('\n-Get related processings');
    const response = await supertest(app.router)
      .get(`/contracts/${contractId}/processings`)
      .set('Cookie', cookie);
    _logGreen('The processings inside the contract:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  it('should update a processing', async () => {
    _logYellow('\n-Update a processing');
    const response = await supertest(app.router)
      .put(`/contracts/${contractId}/processings/update/${processingId}`)
      .set('Cookie', cookie)
      .send({
        catalogId: '1',
        infrastructureServices: [
        { serviceOffering: 'connector-uri-b', participant: 'participant-b' },
        { serviceOffering: 'connector-uri-c', participant: 'participant-c' },
        { serviceOffering: 'connector-uri-d', participant: 'participant-d' },
      ],
    });
    _logGreen('The processings inside the contract:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
