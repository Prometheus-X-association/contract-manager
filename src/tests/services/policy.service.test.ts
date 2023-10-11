import { expect } from 'chai';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import policyProviderService from 'services/policy.provider.service';
import sinon from 'sinon';
import { logger } from 'utils/logger';

const warnSpy = sinon.spy(logger, 'warn');

describe('genPolicies', () => {
  beforeEach(() => {
    warnSpy.resetHistory();
  });

  // Ensure policies are generated correctly for valid permissions.
  it('should generate policies for valid permissions', () => {
    const permissions = [
      {
        '@type': 'Offer',
        target: 'http://example.com/data/resource-2',
        assigner: 'http://example.com/parties/data-provider',
        assignee: 'http://example.com/parties/data-consumer',
        action: 'write',
        data: 'http://example.com/data/sensitive-info',
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
      policyProviderService.genPolicies(permissions);
    const expectedPolicies: IAuthorisationPolicy[] = [
      {
        subject: 'Offer',
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

  it('Should verify if a policy is valid', () => {
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
    const isValid = policyProviderService.verifyOdrlPolicy(validPolicy);
    expect(isValid).to.be.true;
  });

  it('Should verify if a policy with permissions sharing common constraint is valid', () => {
    const validPolicyB = {
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
    const isValidB = policyProviderService.verifyOdrlPolicy(validPolicyB);
    expect(isValidB).to.be.true;
  });

  it('Should verify if a policy including more than one permission is valid', () => {
    const validPolicyC = {
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
    const isValidC = policyProviderService.verifyOdrlPolicy(validPolicyC);
    expect(isValidC).to.be.true;
  });

  /*
  // Ensure unsupported constraint types trigger a warning.
  it('should handle unsupported constraint types', () => {
    const permissions = [
      {
        '@type': 'Offer',
        constraint: [
          {
            // The following type is not supported.
            '@type': 'unsupportedType',
            scope: 'http://example.com/geolocation/us',
            relation: 'within',
          },
        ],
      },
    ];
    policyProviderService.genPolicies(permissions);
    // Check if the warn method was called with the correct message
    sinon.assert.calledWith(
      warnSpy,
      sinon.match('Unsupported constraint type: unsupportedType'),
    );
  });
  */
});
