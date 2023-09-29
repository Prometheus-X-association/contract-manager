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
            '@type': 'spatial',
            scope: 'http://example.com/geolocation/us',
            relation: 'within',
          },
          {
            '@type': 'dateTime',
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
          'spatial.scope': 'http://example.com/geolocation/us',
          'spatial.relation': 'within',
          dateTime: {
            $lt: '2024-06-30T23:59:59Z',
          },
        },
      },
    ];
    expect(result).to.deep.equal(expectedPolicies);
  });

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
});
