import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';
import http from 'http';

let cookie: any;
let contractId: any;
let chainId: any;
const SERVER_PORT = 9999;

describe('Create an ecosystem contract, test service chains related endpoints.', () => {
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
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    expect(authResponse.status).to.equal(200);
  });

  it('should generate an ecosystem contract', async () => {
    const contract = {
      ecosystem: 'ecosystem-id',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [],
      prohibition: [],
    };
    const response = await supertest(app.router)
      .post('/contracts/')
      .set('Cookie', cookie)
      .send({ contract, role: 'ecosystem' });
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('should add connector service chains to the contract', async () => {
    const serviceChains = [
      {
        catalogId: '1',
        services: [
          { service: 'connector-uri-a', participant: 'participant-a' },
          { service: 'connector-uri-b', participant: 'participant-b' },
        ],
      },
    ];
    const response = await supertest(app.router)
      .post(`/contracts/${contractId}/servicechains`)
      .set('Cookie', cookie)
      .send(serviceChains);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body[0]).to.be.an('object');
    expect(response.body[0]).to.have.property('catalogId', '1');
    expect(response.body[0]).to.have.property('services');
    expect(response.body[0]).to.have.property('catalogId');
    chainId = response.body[0].catalogId;
  });

  it('should get related serviceChains', async () => {
    const response = await supertest(app.router)
      .get(`/contracts/${contractId}/servicechains`)
      .set('Cookie', cookie);
    expect(response.status).to.equal(200);
  });

  it('should update a serviceChain', async () => {
    const response = await supertest(app.router)
      .put(`/contracts/${contractId}/servicechains/update/${chainId}`)
      .set('Cookie', cookie)
      .send({
        catalogId: '1',
        services: [
          { service: 'connector-uri-b', participant: 'participant-b' },
          { service: 'connector-uri-c', participant: 'participant-c' },
          { service: 'connector-uri-d', participant: 'participant-d' },
        ],
      });
    expect(response.status).to.equal(200);
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
