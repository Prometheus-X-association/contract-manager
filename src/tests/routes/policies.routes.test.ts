import { config } from 'config/config';
import { expect } from 'chai';
import supertest from 'supertest';
import app from 'server';

let authTokenCookie: any;
const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/pap/policies/';
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
describe('Routes for policies managment Contract API', () => {
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
    const authResponse = await supertest(app.router).get('/user/login');
    authTokenCookie = authResponse.headers['set-cookie'];
    expect(authResponse.status).to.equal(200);
    authToken = authResponse.body.token;
  });

  after(async () => {
    server.close();
    console.log('Test server stopped.');
  });

  it('should verify a policy containing permission and prohibition', async () => {
    const validPolicy = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Agreement',
      permission: [
        {
          target: 'http://example.com/photoAlbum:55',
          action: 'display',
          assigner: 'http://example.com/MyPix:55',
          assignee: 'http://example.com/assignee:55',
        },
      ],
      prohibition: [
        {
          target: 'http://example.com/photoAlbum:55',
          action: 'archive',
          assigner: 'http://example.com/MyPix:55',
          assignee: 'http://example.com/assignee:55',
        },
      ],
    };

    // Send a POST request to create the contract
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}verify`)
      .set('Cookie', authTokenCookie)
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPolicy);
    //
    _logObject(response.body);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
  });
});
