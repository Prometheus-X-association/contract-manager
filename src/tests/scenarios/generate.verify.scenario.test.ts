import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';

let cookie: any;
let policy: any;
let contractId: any;
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
describe('Scenario creating an ecosystem contract and verify a policy', () => {
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

  it('Should ping the server', async () => {
    _logYellow('\n-Ping the server');
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    // authToken = authResponse.body.token;
    // _logGreen('Authentication token:');
    // _logObject(authResponse.body);
    _logGreen('Cookies:');
    _logObject(cookie);
    expect(authResponse.status).to.equal(200);
  });

  it('should setup the user store', async () => {
    const userStore = {
      age: 21,
      role: 'admin',
    };
    const response = await supertest(app.router)
      .put('/user/store')
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(userStore);
    expect(response.status).to.equal(200);
  });

  it('should generate an ecosystem contract', async () => {
    _logYellow('\n-Generate a contract with the following odrl policy');
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target',
          constraint: [
            {
              leftOperand: 'user:age',
              operator: 'gt',
              rightOperand: 17,
            },
          ],
        },
      ],
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
  //
  /*
  it('should verify the user policy', async () => {
    _logYellow('\n-Verify the odrl format of the user policy');
    policy = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Set',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target',
          constraint: [
            {
              leftOperand: 'user:age',
              operator: 'eq',
              rightOperand: 21,
            },
          ],
        },
      ],
    };
    _logGreen('The odrl user policy:');
    _logObject(policy);
    const response = await supertest(app.router)
      .post('/pap/policies/verify')
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policy);
    _logGreen('Policy has been verified:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
  });
  */
  it('should check if the resource requested from the user policy \n\tis exploitable through the etablished contract', async () => {
    _logYellow('\n-Check if resource is exploitable');
    _logGreen('The odrl user policy:');
    _logObject(policy);
    const response = await supertest(app.router)
      .post(`/contracts/check-exploitability/${contractId}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policy);
    _logGreen('Resource is exploitable:');
    _logObject(response.body);
    expect(response.body.authorised).to.equal(true);
  });
  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
