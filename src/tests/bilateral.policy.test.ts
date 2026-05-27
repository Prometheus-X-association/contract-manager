import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Bilateral from 'models/bilateral.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { ruleAccess1 } from './mock/registryMock';

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

describe('Policies Injection test cases for Bilateral Contract.', () => {
  let server: http.Server;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        console.log(`Mongo Url: ${config.mongo.testUrl}`);
        console.log(`Registry Url: ${config.catalog.registry.url}`);
        console.log(`Registry File Ext: ${config.catalog.registry.fileExt}`);
        resolve(true);
      });
    });
    await Bilateral.deleteMany({});
    ruleAccess1();
  });

  it('Should ping the server', async () => {
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    expect(authResponse.status).to.equal(200);
  });

  it('should generate a bilateral contract', async () => {
    const contract = {
      dataProvider: 'provider',
      dataConsumer: 'consumer',
      serviceOffering: 'offering',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [],
      prohibition: [],
    };
    const response = await supertest(app.router)
      .post('/bilaterals/')
      .set('Cookie', cookie)
      .send({ contract });
    expect(response.status).to.equal(201);
    contractId = response.body._id;
  });

  it('Should inject an array of policies from\na given list of injection information', async () => {
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
    const response = await supertest(app.router)
      .put(`/bilaterals/policies/${contractId}`)
      .set('Cookie', cookie)
      .send(policiesArray);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    console.log(JSON.stringify(response.body.contract, null, 2))
    const contract = response.body.contract;
    policiesArray.forEach((policy) => {
      console.log(policy.values.target)
      const targetPermission = contract.policy.find(
        (p: any) =>
          p.permission &&
          p.permission.some(
            (permission: any) => permission.target === policy.values.target,
          ),
      );
      console.log(targetPermission)
      expect(targetPermission).to.exist;
    });
  });

  after(async () => {
    await Bilateral.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
