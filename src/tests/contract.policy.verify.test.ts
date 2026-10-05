import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';

let cookie: any;
let contractId: any;
const SERVER_PORT = 9999;

describe('Scenario creating a Contract (Dataspace use cases) and verify a policy.', () => {
  let server: any;
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
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
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
      .send(userStore);
    expect(response.status).to.equal(200);
  });

  it('should generate an ecosystem contract', async () => {
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target',
          constraint: [
            {
              leftOperand: 'age',
              operator: 'gt',
              rightOperand: 17,
            },
          ],
        },
      ],
    };
    const response = await supertest(app.router)
      .post('/contracts/')
      .set('Cookie', cookie)
      .send({ contract, role: 'ecosystem' });
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('should check if the resource requested from the user policy \n\tis exploitable through the etablished contract', async () => {
    const role = 'ecosystem';
    const policy = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Set',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target',
        },
      ],
    };
    const response = await supertest(app.router)
      .post(`/contracts/role/exploitability/${contractId}/${role}`)
      .set('Cookie', cookie)
      .send(policy);
    expect(response.body.authorised).to.equal(true);
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
