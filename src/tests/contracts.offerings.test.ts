import supertest from 'supertest';
import app from 'server';
import Contract from 'models/contract.model';
import Bilateral from 'models/bilateral.model';
import { config } from 'config/config';
import bilateralService from 'services/bilateral.service';
import { IBilateralContract, IContractDB } from 'interfaces/contract.interface';
import { expect } from 'chai';
import { ContractService } from 'services/contract.service';

const SERVER_PORT = 9999;

describe('Operations on offerings in contracts', () => {
  let server: any;
  let authTokenCookie: any;
  const serviceOfferingId: string = 'serviceOfferingId';

  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });

    await Contract.deleteMany({});
    await Bilateral.deleteMany({});

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];

    // Create a bilateral contract
    const contractData: Partial<IBilateralContract> = {
      dataProvider: 'provider',
      dataConsumer: 'consumer',
      serviceOffering: serviceOfferingId,
    };

    await bilateralService.genContract(contractData as any);

    // Create a ecosystem contract
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target/policy',
        },
        {
          action: 'use',
          target: 'http://contract-target/service',
        },
      ],
      serviceOfferings: [
        {
          participant: 'provider',
          serviceOffering: serviceOfferingId,
          policies: [],
        },
      ],
    };

    const contractService = await ContractService.getInstance();
    await contractService.genContract(contract as any);
  });

  after(async () => {
    // Stop the test server
    server.close();
    console.log('Test server stopped.');
  });

  it('should remove provided service offering from contracts', async () => {
    // Send a DELETE request to remove the service offering
    const response = await supertest(app.router)
      .delete(`/contracts/offerings/${serviceOfferingId}`)
      .set('Cookie', authTokenCookie);

    // Check the response
    expect(response.status).to.equal(200);
    expect(response.body.contractsModified).to.not.equal(0);
    expect(response.body.contractsRemoved).to.not.equal(0);
  });
});
