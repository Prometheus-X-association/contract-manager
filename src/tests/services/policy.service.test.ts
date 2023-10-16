import { expect } from 'chai';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import policyProviderService from 'services/policy.provider.service';
import app from 'server';
import { config } from 'config/config';

const SERVER_PORT = 9999;
const _logObject = (data: any) => {
  console.log(`\x1b[90m${JSON.stringify(data, null, 2)}\x1b[37m`);
};
describe('genPolicies', () => {
  let server: any;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
  });

  after(async () => {
    // Stop the test server
    server.close();
    console.log('Test server stopped.');
  });

  // Ensure policies are generated correctly for valid permissions.
  it('should generate policies for valid permissions/prohibitions', () => {
    const resourceConstraint = [
      {
        target: 'http://example.com/data/resource-2',
        action: 'write',
        constraint: [
          {
            leftOperand: 'relation',
            operator: 'eq',
            rightOperand: 'within',
          },
          {
            leftOperand: 'scope',
            operator: 'eq',
            rightOperand: 'http://example.com/geolocation/us',
          },
          {
            leftOperand: 'currentDateTime',
            operator: 'lt',
            rightOperand: '2024-06-30T23:59:59Z',
          },
        ],
      },
    ];
    const result: IAuthorisationPolicy[] =
      policyProviderService.genPolicies(resourceConstraint);
    const expectedPolicies: IAuthorisationPolicy[] = [
      {
        subject: 'http://example.com/data/resource-2',
        action: 'write',
        conditions: {
          scope: {
            $eq: 'http://example.com/geolocation/us',
          },
          relation: { $eq: 'within' },
          currentDateTime: {
            $lt: '2024-06-30T23:59:59Z',
          },
        },
      },
    ];
    expect(result).to.deep.equal(expectedPolicies);
  });
  //
  it('Should verify if a policy is valid', async () => {
    const validPolicy = {
      '@context': 'https://www.w3.org/ns/odrl.jsonld',
      '@type': 'Offer',
      permission: {
        action: 'use',
        target: 'http://provider/service',
        constraint: [
          {
            leftOperand: 'machineReadable',
            operator: 'eq',
            rightOperand: { '@value': 'true', '@type': 'xsd:boolean' },
          },
        ],
      },
    };
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy with permissions sharing common constraint is valid', async () => {
    const validPolicy = {
      '@context': 'https://www.w3.org/ns/odrl.jsonld',
      '@type': 'Offer',
      permission: [
        {
          action: 'use',
          target: 'http://provider/service/formatProfile',
          profile: 'sharedConstraint',
        },
        {
          action: 'use',
          target: 'http://provider/service/guessAge',
          profile: 'sharedConstraint',
        },
      ],
      constraint: [
        {
          profile: 'sharedConstraint',
          constraints: [
            {
              leftOperand: 'machineReadable',
              operator: 'eq',
              rightOperand: { '@value': 'true', '@type': 'xsd:boolean' },
            },
          ],
        },
      ],
    };
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy including more than one permission is valid', async () => {
    const validPolicy = {
      '@context': 'https://www.w3.org/ns/odrl.jsonld',
      '@type': 'Offer',
      permission: [
        {
          action: 'use',
          target: 'http://provider/gallery/getLastModificationTime',
          constraint: [
            {
              leftOperand: 'userIsRegistered',
              operator: 'eq',
              rightOperand: { '@value': 'true', '@type': 'xsd:boolean' },
            },
          ],
        },
        {
          action: 'use',
          target: 'http://provider/gallery/removeLastPicture',
          constraint: [
            {
              leftOperand: 'userCanRemove',
              operator: 'eq',
              rightOperand: { '@value': 'true', '@type': 'xsd:boolean' },
            },
          ],
        },
      ],
    };
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy with multiple "prohibition" is valid', async () => {
    const validPolicy = {
      '@context': 'http://www.w3.org/ns/odrl.jsonld',
      '@type': 'Agreement',
      prohibition: [
        {
          target: 'http://example.com/photoAlbum:54',
          action: 'archive',
          assigner: 'http://example.com/MyPix:54',
          assignee: 'http://example.com/assignee:54',
        },
        {
          target: 'http://example.com/photoAlbum:55',
          action: 'archive',
          assigner: 'http://example.com/MyPix:55',
          assignee: 'http://example.com/assignee:55',
        },
      ],
    };
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy with "prohibition" and "permission" is valid', async () => {
    const validPolicy = {
      '@context': 'http://www.w3.org/ns/odrl.jsonld',
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
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy using "refinement" is valid', async () => {
    const validPolicy = {
      '@context': 'http://www.w3.org/ns/odrl.jsonld',
      '@type': 'Offer',
      uid: 'http://example.com/policy:6161',
      profile: 'http://example.com/odrl:profile:10',
      permission: [
        {
          target: 'http://example.com/document:1234',
          assigner: 'http://example.com/org:616',
          action: [
            {
              'rdf:value': { '@id': 'odrl:print' },
              refinement: [
                {
                  leftOperand: 'resolution',
                  operator: 'lteq',
                  rightOperand: { '@value': '1200', '@type': 'xsd:integer' },
                  unit: 'http://dbpedia.org/resource/Dots_per_inch',
                },
              ],
            },
          ],
        },
      ],
    };
    const isValid = await policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });
});
