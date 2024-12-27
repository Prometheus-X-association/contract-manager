import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import ContractModel from 'models/contract.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { _logYellow, _logGreen, _logObject } from './utils/utils';
import { IContractDB } from 'interfaces/contract.interface';
import mongoose, { Model } from 'mongoose';

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

let Contract: mongoose.Model<IContractDB>;

describe('Billing rules injection test cases for contract', () => {
  let server: http.Server;

  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    Contract = await ContractModel.getModel();
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

  it('Should inject rule-billing-1', async () => {
    _logYellow('\n-Inject rule-billing-1');
    const role = 'participant';
    const policyData = {
      role,
      ruleId: 'rule-billing-1',
      values: {
        target: 'billing-target-1',
        currentDateTime: new Date().toISOString(),
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    _logGreen('The new contract in database:');
    _logObject(response.body.contract);
    expect(response.body.contract.rolesAndObligations).to.be.an('array');
    const roleEntry = response.body.contract.rolesAndObligations.find(
      (entry: any) => entry.role === role,
    );
    expect(roleEntry).to.exist;
    expect(roleEntry.policies).to.be.an('array');
    const policy = roleEntry.policies.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'subscriptionDateTime',
    );
  });

  it('Should inject rule-billing-2', async () => {
    _logYellow('\n-Inject rule-billing-2');
    const role = 'participant';
    const policyData = {
      role,
      ruleId: 'rule-billing-2',
      values: {
        target: 'billing-target-2',
        amount: 100,
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    _logGreen('The new contract in database:');
    _logObject(response.body.contract);
    expect(response.body.contract.rolesAndObligations).to.be.an('array');
    const roleEntry = response.body.contract.rolesAndObligations.find(
      (entry: any) => entry.role === role,
    );
    expect(roleEntry).to.exist;
    expect(roleEntry.policies).to.be.an('array');
    const policy = roleEntry.policies.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'payAmount',
    );
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      100,
    );
  });

  it('Should inject rule-billing-3', async () => {
    _logYellow('\n-Inject rule-billing-3');
    const role = 'participant';
    const policyData = {
      role,
      ruleId: 'rule-billing-3',
      values: {
        target: 'billing-target-3',
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    _logGreen('The new contract in database:');
    _logObject(response.body.contract);
    expect(response.body.contract.rolesAndObligations).to.be.an('array');
    const roleEntry = response.body.contract.rolesAndObligations.find(
      (entry: any) => entry.role === role,
    );
    expect(roleEntry).to.exist;
    expect(roleEntry.policies).to.be.an('array');
    const policy = roleEntry.policies.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'usageCount',
    );
  });

  it('Should inject rule-billing-4', async () => {
    _logYellow('\n-Inject rule-billing-4');
    const role = 'participant';
    const policyData = {
      role,
      ruleId: 'rule-billing-4',
      values: {
        target: 'billing-target-4',
        currentDateTime: new Date().toISOString(),
        amount: 150,
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .send(policyData);
    expect(response.status).to.equal(200);
    _logGreen('The new contract in database:');
    _logObject(response.body.contract);
    expect(response.body.contract.rolesAndObligations).to.be.an('array');
    const roleEntry = response.body.contract.rolesAndObligations.find(
      (entry: any) => entry.role === role,
    );
    expect(roleEntry).to.exist;
    expect(roleEntry.policies).to.be.an('array');
    const policy = roleEntry.policies.find(
      (p: any) => p.permission[0].target === policyData.values.target,
    );
    expect(policy).to.exist;

    expect(policy.permission[0].duty[0].action).to.equal('compensate');
    expect(policy.permission[0].duty[0].constraint[0].leftOperand).to.equal(
      'subscriptionDateTime',
    );
    expect(policy.permission[0].duty[0].constraint[0].operator).to.equal(
      'lteq',
    );
    expect(policy.permission[0].duty[0].constraint[0].rightOperand).to.equal(
      policyData.values.currentDateTime,
    );

    const firstConsequence = policy.permission[0].duty[0].consequence[0];
    expect(firstConsequence.action).to.equal('compensate');
    expect(firstConsequence.constraint[0].leftOperand).to.equal('payAmount');
    expect(firstConsequence.constraint[0].operator).to.equal('eq');
    expect(firstConsequence.constraint[0].rightOperand).to.equal(
      policyData.values.amount,
    );
    expect(firstConsequence.constraint[0].unit).to.equal('EUR');

    const secondConsequence = firstConsequence.consequence[0];
    expect(secondConsequence.action).to.equal('extract');
    expect(secondConsequence.constraint[0].leftOperand).to.equal('usageCount');
    expect(secondConsequence.constraint[0].operator).to.equal('gt');
    expect(secondConsequence.constraint[0].rightOperand).to.equal(0);
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
