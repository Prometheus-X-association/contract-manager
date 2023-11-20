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

  it('Should get "No Restriction" policy id', async () => {
    _logYellow('\n-Get policies named "No Restriction".');
    const policyName = 'No Restriction';
    const response = await supertest(app.router)
      .get(`/pap/policies/${policyName}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`);
    _logGreen('The result of the request:');
    expect(response.status).to.equal(200);
    _logObject(response.body);
    expect(response.body).to.be.an('array');
    expect(response.body).to.not.be.empty;
    expect(response.body[0]).to.have.property('_id').that.is.a('string');
    policyId = response.body[0]._id;
  });

  it('Should inject a policy', async () => {
    _logYellow('\n-Inject a policy for resource access.');
    const role = 'ecosystem';
    const policyData = {
      role,
      policyId,
      values: {
        target: 'a-target-uid',
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .post(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policyData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('contract');
    const contract = response.body.contract;
    _logGreen('The new contract in database:');
    _logObject(contract);
    expect(contract._id).to.be.a('string');
  });

  it('Should inject a policy by role (participant)', async () => {
    _logYellow('\n-Inject a policy for resources accessed by a specific role.');
    const role = 'participant';
    const policyData = {
      role,
      policyId,
      values: {
        target: 'a-target-uid-for-participant-role',
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
  });

  it('Should inject a second policy by role (participant)', async () => {
    _logYellow(
      '\n-Inject a second policy for resources accessed by a specific role.',
    );
    const role = 'participant';
    const target = 'a-second-target-uid-for-participant-role';
    const policyData = {
      role,
      policyId,
      values: {
        target,
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
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    const roleParticipantEntry = contract.rolesAndObligations.find(
      (entry: any) => entry.role === 'participant',
    );
    expect(roleParticipantEntry).to.be.an('object');
    expect(roleParticipantEntry.policies).to.be.an('array');
    expect(roleParticipantEntry.policies.length).to.be.at.least(1);
    const targetPermission = roleParticipantEntry.policies.find(
      (policy: any) => {
        return (
          policy.permission &&
          policy.permission.some(
            (permission: any) => permission.target === target,
          )
        );
      },
    );
    expect(targetPermission).to.exist;
  });

  it('Should inject an array of policies', async () => {
    _logYellow('\n-Inject a set of policies.');

    const role = 'provider';
    const policiesArray = [
      {
        role,
        policyId,
        values: {
          target: 'target-a',
        },
      },
      {
        role,
        policyId,
        values: {
          target: 'target-b',
        },
      },
      {
        role,
        policyId,
        values: {
          target: 'target-c',
        },
      },
    ];
    _logGreen('The input policies:');
    _logObject(policiesArray);
    const response = await supertest(app.router)
      .post(`/contracts/policies/${contractId}`)
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(policiesArray);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    const roleParticipantEntry = contract.rolesAndObligations.find(
      (entry: any) => entry.role === role,
    );
    expect(roleParticipantEntry).to.be.an('object');
    expect(roleParticipantEntry.policies).to.be.an('array');
    expect(roleParticipantEntry.policies.length).to.be.at.least(
      policiesArray.length,
    );
    policiesArray.forEach((policy) => {
      const targetPermission = roleParticipantEntry.policies.find(
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
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
