import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { _logYellow, _logGreen, _logObject, wait } from './utils/utils';

let cookie: any;
let server: http.Server;
let contractId: string;
const SERVER_PORT = 9999;

if (!config.catalog.registry.defined) {
  let url = config.server.url;
  if (url.endsWith('/')) url = url.slice(0, -1);
  axios.defaults.baseURL = `${config.server.url}:${SERVER_PORT}/`;
}

describe('Contract Negotiation Integration Tests', () => {
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        _logYellow('Test server running on port ' + SERVER_PORT);
        resolve(true);
      });
    });
    await Contract.deleteMany({});
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
    _logYellow('Test server stopped');
  });

  it('should retrieve the cookie after pinging the server', async () => {
    _logYellow('\n-Login the user');
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    _logGreen('Cookies:');
    _logObject(cookie);
    expect(authResponse.status).to.equal(200);
  });

  it('should create a new contract and update profile', async () => {
    _logYellow('\n-Creating test contract');
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      ecosystem: 'ecosystem-1',
      orchestrator: 'orchestrator-1',
      serviceOfferings: [
        {
          participant: 'participant-1',
          serviceOffering: 'service-123',
          policies: [
            {
              description: 'Test policy',
              permission: [
                {
                  action: 'read',
                  target: 'data-123',
                  duty: [],
                  constraint: [],
                },
              ],
            },
          ],
        },
      ],
      members: [
        {
          participant: 'participant-1',
          role: 'consumer',
          signature: 'signature-participant-1',
        },
      ],
      status: 'signed',
    };

    _logGreen('Input contract:');
    _logObject(contract);

    const contractResponse = await supertest(app.router)
      .post('/contracts/')
      .set('Cookie', cookie)
      .send({ contract, role: 'ecosystem' });

    expect(contractResponse.status).to.equal(201);
    contractId = contractResponse.body._id;

    _logGreen('Created contract:');
    _logObject(contractResponse.body);

    // Wait for the profile to be initialized
    await wait(1000);

    _logYellow('\n-Updating profile preferences');
    const profileId = 'participant-1';
    const preferences = [
      {
        policies: [{ policy: 'test-policy', frequency: 1 }],
        services: ['test-service'],
        ecosystems: ['test-ecosystem'],
      },
    ];

    const updateResponse = await supertest(app.router)
      .put('/negotiation/profile/preferences')
      .set('Cookie', cookie)
      .send({
        profileId,
        preferences,
      });

    expect(updateResponse.status).to.equal(200);

    _logGreen('Updated profile preferences:');
    _logObject(updateResponse.body);
  });

  it('should test policy acceptance', async () => {
    _logYellow('\n-Testing policy acceptance');
    const profileId = 'participant-1';

    const policyTest = {
      endpoint: '/negotiation/policy/acceptance',
      payload: {
        profileId,
        policyData: {
          description: 'test-policy',
          permission: [
            {
              action: 'use',
              target: 'test-target',
              constraint: [],
              duty: [],
            },
          ],
          prohibition: [],
        },
      },
    };

    const policyResponse = await supertest(app.router)
      .post(policyTest.endpoint)
      .set('Cookie', cookie)
      .send(policyTest.payload);

    expect(policyResponse.status).to.equal(200);
    expect(policyResponse.body).to.have.property('isAcceptable');
  });

  it('should test service acceptance', async () => {
    _logYellow('\n-Testing service acceptance');
    const profileId = 'participant-1';

    const serviceTest = {
      endpoint: '/negotiation/service/acceptance',
      payload: {
        profileId,
        serviceData: {
          participant: 'test',
          serviceOffering: 'test-service',
          policies: [
            {
              description: 'test-policy',
              permission: [
                {
                  action: 'use',
                  target: 'test-target',
                  constraint: [],
                  duty: [],
                },
              ],
              prohibition: [],
            },
          ],
        },
      },
    };

    const serviceResponse = await supertest(app.router)
      .post(serviceTest.endpoint)
      .set('Cookie', cookie)
      .send(serviceTest.payload);

    expect(serviceResponse.status).to.equal(200);
    expect(serviceResponse.body).to.have.property('isAcceptable');
  });

  it('should test contract acceptance', async () => {
    _logYellow('\n-Testing contract acceptance');
    const profileId = 'participant-1';

    const contractTest = {
      endpoint: '/negotiation/contract/acceptance',
      payload: {
        profileId,
        contractData: {
          _id: contractId,
          ecosystem: 'test-ecosystem',
          '@context': 'http://www.w3.org/ns/odrl/2/',
          '@type': 'Offer',
          serviceOfferings: [
            {
              participant: 'test',
              serviceOffering: 'test-service',
              policies: [
                {
                  description: 'test-policy',
                  permission: [
                    {
                      action: 'use',
                      target: 'test-target',
                      constraint: [],
                      duty: [],
                    },
                  ],
                  prohibition: [],
                },
              ],
            },
          ],
          status: 'signed',
        },
      },
    };

    const contractAcceptResponse = await supertest(app.router)
      .post(contractTest.endpoint)
      .set('Cookie', cookie)
      .send(contractTest.payload);

    expect(contractAcceptResponse.status).to.equal(200);
    expect(contractAcceptResponse.body).to.have.property('canAccept');
  });

  it('should test contract negotiation', async () => {
    _logYellow('\n-Testing contract negotiation');
    const profileId = 'participant-1';

    const contractTest = {
      payload: {
        profileId,
        contractData: {
          _id: contractId,
          ecosystem: 'test-ecosystem',
          '@context': 'http://www.w3.org/ns/odrl/2/',
          '@type': 'Offer',
          serviceOfferings: [
            {
              participant: 'test',
              serviceOffering: 'test-service',
              policies: [
                {
                  description: 'test-policy',
                  permission: [
                    {
                      action: 'use',
                      target: 'test-target',
                      constraint: [],
                      duty: [],
                    },
                  ],
                  prohibition: [],
                },
              ],
            },
          ],
          status: 'signed',
        },
      },
    };

    const negotiateResponse = await supertest(app.router)
      .post('/negotiation/contract/negotiate')
      .set('Cookie', cookie)
      .send(contractTest.payload);

    expect(negotiateResponse.status).to.equal(200);
    expect(negotiateResponse.body).to.have.property('canAccept');
  });
});
