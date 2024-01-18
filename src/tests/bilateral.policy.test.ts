import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Bilateral from 'models/bilateral.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';

let cookie: any;
let contractId: any;
let ruleId: string = 'rule-access-1';

const SERVER_PORT = 9999;
if (!config.catalog.registry.defined) {
  let url = config.server.url;
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  axios.defaults.baseURL = `${config.server.url}:${SERVER_PORT}/`;
}
const _logYellow = (value: string) => {
  console.log(`\x1b[93m${value}\x1b[37m`);
};
const _logGreen = (value: string) => {
  console.log(`\x1b[32m${value}\x1b[37m`);
};
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
describe('Create a bilateral contract, then inject policies in it.', () => {
  let server: http.Server;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    await Bilateral.deleteMany({});
  });

  it('Should ping the server', async () => {
    _logYellow('\n-Ping the server');
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    _logGreen('Cookies:');
    _logObject(cookie);
    expect(authResponse.status).to.equal(200);
  });

  it('should generate a bilateral contract', async () => {
    _logYellow('\n-Generate a contract with the following odrl policy');
    const contract = {
      dataProvider: 'provider',
      dataConsumer: 'consumer',
      serviceOffering: 'offering',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [],
      prohibition: [],
    };
    _logGreen('The odrl input contract:');
    _logObject(contract);
    const response = await supertest(app.router)
      .post('/bilaterals/')
      .set('Cookie', cookie)
      .send(contract);
    _logGreen('The contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('Should inject an array of policies from\na given list of injection information', async () => {
    _logYellow('\n-Inject a set of policies.');
    const policiesArray = [
      {
        ruleId,
        values: {
          target: 'target-a',
        },
      },
      {
        ruleId,
        values: {
          target: 'target-b',
        },
      },
      {
        ruleId,
        values: {
          target: 'target-c',
        },
      },
    ];
    _logGreen('The input policies information to be injected:');
    _logObject(policiesArray);
    const response = await supertest(app.router)
      .post(`/bilaterals/policies/${contractId}`)
      .set('Cookie', cookie)
      .send(policiesArray);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    policiesArray.forEach((policy) => {
      const targetPermission = contract.policy.find(
        (p: any) =>
          p.permission &&
          p.permission.some(
            (permission: any) => permission.target === policy.values.target,
          ),
      );
      expect(targetPermission).to.exist;
    });
  });

  after(async () => {
    await Bilateral.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
