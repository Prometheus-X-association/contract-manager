import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';

const SERVER_PORT = 9999;
describe('Test route to Ping the API', () => {
  let server: any;
  before(async () => {
    server = await app.startServer();
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
  });

  after(() => {
    server.close();
    console.log('Test server stopped.');
  });

  it('should get a response on is-it-alive', async () => {
    const response = await supertest(app.router).get(`/is-it-alive/`);
    expect(response.status).to.equal(200);
  });
});
