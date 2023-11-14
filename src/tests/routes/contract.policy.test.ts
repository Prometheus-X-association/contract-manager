import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';

let cookie: any;
let contractId: any;
let policyId: string;

const SERVER_PORT = 9999;
const _logYellow = (value: string) => {
  console.log(`\x1b[93m${value}\x1b[37m`);
};
const _logGreen = (value: string) => {
  console.log(`\x1b[32m${value}\x1b[37m`);
};
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
describe('Create an ecosystem contract, then inject policies in it.', () => {
  let server: any;
  let authToken: string;
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

  it('should log the user', async () => {
    _logYellow('\n-Login the user');
    const authResponse = await supertest(app.router).get('/user/login');
    cookie = authResponse.headers['set-cookie'];
    authToken = authResponse.body.token;
    _logGreen('Authentication token:');
    _logObject(authResponse.body);
    _logGreen('Cookies:');
    _logObject(cookie);
    expect(authResponse.status).to.equal(200);
  });

  it('should generate an ecosystem contract', async () => {
    _logYellow('\n-Generate a contract with the following odrl policy');
    const contract = {
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
      .set('Authorization', `Bearer ${authToken}`)
      .send(contract);
    _logGreen('The contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('Should inject a policy', async () => {
    _logYellow('\n-Inject a policy for resource access.');
    const policyData = {
      policyId,
      values: {
        target: '',
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .post(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policyData);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    contractId = response.body._id;
    // ...
  });

  it('Should inject a policy by role', async () => {
    _logYellow('\n-Inject a policy for resources accessed by a specific role.');
    const policyData = {
      policyId,
      values: {
        target: '',
      },
    };
    const role = 'participant';
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .post(`/contracts/policy/${role}/${contractId}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policyData);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    contractId = response.body._id;
    // ...
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
