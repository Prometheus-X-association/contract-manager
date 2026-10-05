import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Bilateral from 'models/bilateral.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { ruleAccess1, ruleBilling1, ruleBilling2, ruleBilling3, ruleBilling4 } from './mock/registryMock';

let cookie: any;
let contractId: any;

const SERVER_PORT = 9999;
if (!config.catalog.registry.defined) {
  let url = config.server.url;
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  axios.defaults.baseURL = `${config.server.url}:${SERVER_PORT}/`;
}

describe('Billing rules injection test cases for Bilateral Contract', () => {
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

  it('Should inject rule-billing-1', async () => {
    ruleBilling1();
    const policyData = {
      policyId: 'rule-billing-1',
      values: {
        target: 'billing-target-1',
        currentDateTime: new Date().toISOString(),
      },
    };
    const response = await supertest(app.router)
      .put(`/bilaterals/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    const policy = response.body.contract.policy.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'subscriptionDateTime',
    );
    expect(policy.permission[0].duty[0].constraint[0].operator).to.equal(
      'lteq',
    );
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      policyData.values.currentDateTime,
    );
  });

  it('Should inject rule-billing-2', async () => {
    ruleBilling2();
    const policyData = {
      policyId: 'rule-billing-2',
      values: {
        target: 'billing-target-2',
        amount: 100,
      },
    };
    const response = await supertest(app.router)
      .put(`/bilaterals/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    const policy = response.body.contract.policy.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'payAmount',
    );
    expect(policy.permission[0].duty[0].constraint[0].operator).to.equal('eq');
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      100,
    );
    expect(policy.permission[0].duty[0].constraint[0].unit).to.equal('EUR');
  });

  it('Should inject rule-billing-3', async () => {
    ruleBilling3();
    const policyData = {
      policyId: 'rule-billing-3',
      values: {
        target: 'billing-target-3',
      },
    };
    const response = await supertest(app.router)
      .put(`/bilaterals/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    const policy = response.body.contract.policy.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'usageCount',
    );
    expect(policy.permission[0].duty[0].constraint[0].operator).to.equal('gt');
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(0);
  });

  it('Should inject rule-billing-4', async () => {
    ruleBilling4();
    const policyData = {
      policyId: 'rule-billing-4',
      values: {
        target: 'billing-target-4',
        currentDateTime: new Date().toISOString(),
        amount: 150,
      },
    };
    const response = await supertest(app.router)
      .put(`/bilaterals/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    const policy = response.body.contract.policy.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'subscriptionDateTime',
    );
    expect(policy.permission[0].duty[0].constraint[0].operator).to.equal(
      'lteq',
    );
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      policyData.values.currentDateTime,
    );
    expect(
      policy.permission[0].duty[0].consequence[0].constraint[0].leftOperand,
    ).to.equal('payAmount');
    expect(
      policy.permission[0].duty[0].consequence[0].constraint[0].operator,
    ).to.equal('eq');
    expect(
      policy.permission[0].duty[0].consequence[0].constraint[0].rightOperand,
    ).to.equal(150);
    expect(
      policy.permission[0].duty[0].consequence[0].constraint[0].unit,
    ).to.equal('EUR');
    expect(
      policy.permission[0].duty[0].consequence[0].consequence[0].constraint[0]
        .leftOperand,
    ).to.equal('usageCount');
    expect(
      policy.permission[0].duty[0].consequence[0].consequence[0].constraint[0]
        .operator,
    ).to.equal('gt');
    expect(
      policy.permission[0].duty[0].consequence[0].consequence[0].constraint[0]
        .rightOperand,
    ).to.equal(0);
  });

  it('Should update an existing policy', async () => {
    ruleBilling2();
    const policyData = {
      policyId: 'rule-billing-2',
      values: {
        target: 'billing-target-2-updated',
        amount: 200,
      },
    };
    const response = await supertest(app.router)
      .put(`/bilaterals/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    const policy = response.body.contract.policy.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].target).to.equal('billing-target-2-updated');
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      200,
    );
  });

  it('Should inject multiple policies (rule-billing-1 and rule-billing-2)', async () => {
    ruleBilling1();
    ruleBilling2();
    const policiesArray = [
      {
        ruleId: 'rule-billing-1',
        values: {
          target: 'multi-billing-target-1',
          currentDateTime: new Date().toISOString(),
        },
      },
      {
        ruleId: 'rule-billing-2',
        values: {
          target: 'multi-billing-target-2',
          amount: 250,
        },
      },
    ];
    const response = await supertest(app.router)
      .put(`/bilaterals/policies/${contractId}`)
      .set('Cookie', cookie)
      .send(policiesArray);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;

    const policy1 = contract.policy.find(
      (p: any) =>
        p.permission &&
        p.permission.some(
          (perm: any) => perm.target === 'multi-billing-target-1',
        ),
    );
    expect(policy1).to.exist;
    expect(policy1.permission[0].target).to.equal('multi-billing-target-1');
    expect(policy1.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'subscriptionDateTime',
    );
    expect(policy1.permission[0].duty[0].constraint[0].operator).to.equal(
      'lteq',
    );
    expect(policy1.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      policiesArray[0].values.currentDateTime,
    );

    const policy2 = contract.policy.find(
      (p: any) =>
        p.permission &&
        p.permission.some(
          (perm: any) => perm.target === 'multi-billing-target-2',
        ),
    );
    expect(policy2).to.exist;
    expect(policy2.permission[0].target).to.equal('multi-billing-target-2');
    expect(policy2.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'payAmount',
    );
    expect(policy2.permission[0].duty[0].constraint[0].operator).to.equal('eq');
    expect(policy2.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      250,
    );
    expect(policy2.permission[0].duty[0].constraint[0].unit).to.equal('EUR');
  });

  after(async () => {
    await Bilateral.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
