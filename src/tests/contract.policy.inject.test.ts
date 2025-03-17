import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { _logGreen, _logObject, _logYellow } from './utils/utils';

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

describe('Policies injection test cases for contract (Dataspace use cases).', () => {
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

  it('Should inject a policy', async () => {
    _logYellow('\n-Inject a policy for resource access.');
    const role = 'ecosystem';
    const policyData = {
      role,
      ruleId,
      values: {
        target: 'a-target-uid',
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
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
      ruleId,
      values: {
        target: 'a-target-uid-for-participant-role',
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
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
      ruleId,
      values: {
        target,
      },
    };
    _logGreen('The input policy set:');
    _logObject(policyData);
    const response = await supertest(app.router)
      .put(`/contracts/policy/${contractId}`)
      .set('Cookie', cookie)
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

  it('Should inject an array of policies from\na given list of injection information', async () => {
    _logYellow('\n-Inject a set of policies.');

    const role = 'provider';
    const policiesArray = [
      {
        role,
        ruleId,
        values: {
          target: 'target-a',
        },
      },
      {
        role,
        ruleId,
        values: {
          target: 'target-b',
        },
      },
      {
        role,
        ruleId,
        values: {
          target: 'target-c',
        },
      },
    ];
    _logGreen('The input policies information to be injected:');
    _logObject(policiesArray);
    const response = await supertest(app.router)
      .put(`/contracts/policies/${contractId}`)
      .set('Cookie', cookie)
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

  it('Should inject an array of policies from a given role and\na list of injections information', async () => {
    _logYellow('\n-Inject a set of policies.');
    const role = 'service';
    const data = {
      role,
      policies: [
        {
          ruleId,
          values: {
            target: 'target-d',
          },
        },
        {
          ruleId,
          values: {
            target: 'target-e',
          },
        },
        {
          ruleId,
          values: {
            target: 'target-f',
          },
        },
      ],
    };
    _logGreen('The input policies information to be injected:');
    _logObject(data);
    const response = await supertest(app.router)
      .put(`/contracts/policies/role/${contractId}`)
      .set('Cookie', cookie)
      .send(data);
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
      data.policies.length,
    );
    data.policies.forEach((policy) => {
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

  it('Should inject an array of policies from a given offering id and\na list of injections information', async () => {
    _logYellow('\n-Inject a set of policies.');
    const participant = 'participant';
    const serviceOffering = 'offering';
    const data = {
      participant,
      serviceOffering,
      policies: [
        {
          ruleId,
          values: {
            target: 'target-offering-a',
          },
        },
        {
          ruleId,
          values: {
            target: 'target-offering-b',
          },
        },
        {
          ruleId,
          values: {
            target: 'target-offering-c',
          },
        },
      ],
    };
    _logGreen('The input policies information to be injected:');
    _logObject(data);
    const response = await supertest(app.router)
      .put(`/contracts/policies/offering/${contractId}`)
      .set('Cookie', cookie)
      .send(data);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    const entry = contract.serviceOfferings.find(
      (entry: any) =>
        entry.serviceOffering === serviceOffering &&
        entry.participant === participant,
    );
    expect(entry).to.be.an('object');
    expect(entry.policies).to.be.an('array');
    expect(entry.policies.length).to.be.at.least(data.policies.length);
    data.policies.forEach((policy) => {
      const targetPermission = entry.policies.find(
        (p: any) =>
          p.permission &&
          p.permission.some(
            (permission: any) => permission.target === policy.values.target,
          ),
      );
      expect(targetPermission).to.exist;
    });
  });

  it('Should retrieve a valid policies for a given service offering', async () => {
    _logYellow('\n-Retrieve policies for a given service offering.');
    const response = await supertest(app.router)
      .get(
        `/contracts/serviceoffering/${contractId}?participant=participant&serviceOffering=offering`,
      )
      .set('Cookie', cookie);
    _logGreen('Policies:');
    _logObject(response.body);
    expect(response.body).to.be.an('array');
    expect(response.body).to.deep.include.members([
      {
        description: 'CAN use data without any restrictions',
        permission: [
          {
            action: 'use',
            target: 'target-offering-a',
            constraint: [],
            duty: [],
          },
        ],
        prohibition: [],
      },
      {
        description: 'CAN use data without any restrictions',
        permission: [
          {
            action: 'use',
            target: 'target-offering-b',
            constraint: [],
            duty: [],
          },
        ],
        prohibition: [],
      },
      {
        description: 'CAN use data without any restrictions',
        permission: [
          {
            action: 'use',
            target: 'target-offering-c',
            constraint: [],
            duty: [],
          },
        ],
        prohibition: [],
      },
    ]);
  });

  it('Should iterate over an array, injecting policies for a specified list of roles.', async () => {
    _logYellow('\n-Inject a set of policies.');
    const data = [
      {
        roles: ['role-1', 'role-2'],
        policies: [
          {
            ruleId,
            values: {
              target: 'multiple-role-target-a',
            },
          },
          {
            ruleId,
            values: {
              target: 'multiple-role-target-b',
            },
          },
        ],
      },
      {
        roles: ['role-3', 'role-4'],
        policies: [
          {
            ruleId,
            values: {
              target: 'multiple-role-target-c',
            },
          },
          {
            ruleId,
            values: {
              target: 'multiple-role-target-d',
            },
          },
        ],
      },
    ];
    _logGreen('The input policies information to be injected:');
    _logObject(data);
    const response = await supertest(app.router)
      .put(`/contracts/policies/roles/${contractId}`)
      .set('Cookie', cookie)
      .send(data);
    _logGreen('The new contract in the database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    data.forEach((entry) => {
      entry.roles.forEach((role) => {
        const roleParticipantEntry = contract.rolesAndObligations.find(
          (entry: any) => entry.role === role,
        );
        expect(roleParticipantEntry).to.be.an('object');
        expect(roleParticipantEntry.policies).to.be.an('array');
        expect(roleParticipantEntry.policies.length).to.be.at.least(
          entry.policies.length,
        );
        entry.policies.forEach((policy) => {
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
    });
  });

  it('Should remove a set of policies from a given offering and participant.', async () => {
    _logYellow('\n-Remove a set of policies.');
    const participantId = 'participant';
    const offeringId = 'offering';
    const response = await supertest(app.router)
      .delete(
        `/contracts/policies/offering/${contractId}/${offeringId}/${participantId}`,
      )
      .set('Cookie', cookie);
    _logGreen('The new contract in database:');
    _logObject(response.body);
    expect(response.status).to.equal(200);
    expect(response.body.contract).to.be.an('object');
    const contract = response.body.contract;
    const entry = contract.serviceOfferings.find(
      (entry: any) =>
        entry.serviceOffering === offeringId &&
        entry.participant === participantId,
    );
    expect(entry).to.be.an('object');
    expect(entry.policies).to.be.an('array');
    expect(entry.policies.length).to.be.equal(0);
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    console.log('Test server stopped.');
  });
});
