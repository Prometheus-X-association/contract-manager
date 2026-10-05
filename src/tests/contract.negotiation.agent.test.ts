import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { config } from 'config/config';
import axios from 'axios';
import http from 'http';
import { wait } from './utils/utils';

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
        resolve(true);
      });
    });
    await Contract.deleteMany({});
  });

  after(async () => {
    await Contract.deleteMany({});
    server.close();
  });

  it('should retrieve the cookie after pinging the server', async () => {
    const authResponse = await supertest(app.router).get('/ping');
    cookie = authResponse.headers['set-cookie'];
    expect(authResponse.status).to.equal(200);
  });

  it('should create a new contract and update profile', async () => {
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


    const contractResponse = await supertest(app.router)
      .post('/contracts/')
      .set('Cookie', cookie)
      .send({ contract, role: 'ecosystem' });

    expect(contractResponse.status).to.equal(201);
    contractId = contractResponse.body._id;

    // Wait for the profile to be initialized
    await wait(1000);

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

  });

  it('should test policy acceptance', async () => {
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
