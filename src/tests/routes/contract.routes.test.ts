import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';

const SERVER_PORT = 9999;
describe('Routes for Contract API', () => {
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

  // Variable to store the ID of the created contract
  let createdContractId: String;
  // Test case: Create a new contract
  it('should create a new contract', async () => {
    const contractData = {
      '@context': 'context',
      '@type': 'type',
      '@id': 'id',
      permission: [
        {
          '@type': 'Offer',
        },
      ],
    };
    // Send a POST request to create the contract
    const response = await supertest(app.router)
      .post('/contracts')
      .send(contractData);
    // Check if the response status is 201 (Created)
    expect(response.status).to.equal(201);
    // Check if the response has a 'id' property
    expect(response.body).to.have.property('id');
    // Store the contract ID for later use (for update and delete tests)
    createdContractId = response.body.id;
  });

  // Test case: Get a contract by ID
  it('should get a contract by ID', async () => {
    // Send a GET request to retrieve the contract by its ID
    const response = await supertest(app.router).get(
      `/contracts/${createdContractId}`,
    );
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has a 'id' property
    expect(response.body).to.have.property('id');
  });

  // Test case: Update a contract by ID
  it('should update a contract by ID', async () => {
    const updatedContractData = {
      updated: true,
    };
    // Send a PUT request to update the contract by its ID
    const response = await supertest(app.router)
      .put(`/contracts/${createdContractId}`)
      .send(updatedContractData);
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has the expected 'message'
    expect(response.body).to.have.property(
      'message',
      'Contract updated successfully',
    );
  });

  // Test case: Delete a contract by ID
  it('should delete a contract by ID', async () => {
    // Send a DELETE request to delete the contract by its ID
    const response = await supertest(app.router).delete(
      `/contracts/${createdContractId}`,
    );
    // Check if the response status is 200 (OK)
    expect(response.status).to.equal(200);
    // Check if the response has the expected 'message'
    expect(response.body).to.have.property(
      'message',
      'Contract deleted successfully',
    );
  });
});
