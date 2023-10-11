import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import PolicyReferenceRegistry from 'models/policy.registry.model';
import Ajv, { ValidateFunction } from 'ajv';
import { logger } from 'utils/logger';

// temporary odrl policy schema to put in data base
const odrlSchemas = [
  {
    type: 'object',
    properties: {
      '@context': { type: 'string' },
      '@type': { type: 'string' },
      permission: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          target: { type: 'string' },
          constraint: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                leftOperand: { type: 'string' },
                operator: { type: 'string' },
                rightOperand: {
                  type: 'object',
                  properties: {
                    '@value': { type: 'string' },
                    '@type': { type: 'string' },
                  },
                  required: ['@value', '@type'],
                },
              },
              required: ['leftOperand', 'operator', 'rightOperand'],
            },
          },
        },
        required: ['action', 'target', 'constraint'],
        additionalProperties: false,
      },
    },
    required: ['@context', '@type', 'permission'],
    additionalProperties: false,
  },
  {
    type: 'object',
    properties: {
      '@context': { type: 'string' },
      '@type': { type: 'string' },
      permission: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            target: { type: 'string' },
            profile: { type: 'string' },
          },
          required: ['action', 'target', 'profile'],
          additionalProperties: false,
        },
      },
      constraint: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            profile: { type: 'string' },
            constraints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  leftOperand: { type: 'string' },
                  operator: { type: 'string' },
                  rightOperand: {
                    type: 'object',
                    properties: {
                      '@value': { type: 'string' },
                      '@type': { type: 'string' },
                    },
                    required: ['@value', '@type'],
                  },
                },
                required: ['leftOperand', 'operator', 'rightOperand'],
              },
            },
          },
          required: ['profile', 'constraints'],
          additionalProperties: false,
        },
      },
    },
    required: ['@context', '@type', 'permission'],
    additionalProperties: false,
  },
  {
    type: 'object',
    properties: {
      '@context': { type: 'string' },
      '@type': { type: 'string' },
      permission: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            target: { type: 'string' },
            constraint: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  leftOperand: { type: 'string' },
                  operator: { type: 'string' },
                  rightOperand: {
                    type: 'object',
                    properties: {
                      '@value': { type: 'string' },
                      '@type': { type: 'string' },
                    },
                    required: ['@value', '@type'],
                  },
                },
                required: ['leftOperand', 'operator', 'rightOperand'],
              },
            },
          },
          required: ['action', 'target', 'constraint'],
        },
      },
    },
    required: ['@context', '@type', 'permission'],
    additionalProperties: false,
  },
];

const operators: any = Object.freeze({
  eq: '$eq',
  lt: '$lt',
  lte: '$lte',
  gt: '$gt',
  gte: '$gte',
  isAnyOf: '$in',
  isNoneOf: '$nin',
  ne: '$ne',
});

/**
 * Policy Provider Service.
 */
export class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policies: IAuthorisationPolicy[];
  private policiesPromise: Promise<IAuthorisationPolicy[]>;
  private validateFunctions: Function[];

  private constructor() {
    this.policies = [];
    this.policiesPromise = this.fetchAuthorisationPolicies();
    const ajv = new Ajv();
    this.validateFunctions = odrlSchemas.map((schema) => ajv.compile(schema));
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
  }

  /**
   * Verifies the validity of an ODRL policy.
   *
   * @param {any} policy - The ODRL policy to verify.
   * @returns {boolean} True if the policy is valid, otherwise false.
   */
  public verifyOdrlPolicy(policy: any): boolean {
    return this.validateFunctions.some((validateFunction) =>
      validateFunction(policy),
    );
  }

  public async fetchAuthorisationPolicies(): Promise<IAuthorisationPolicy[]> {
    try {
      // Find the PolicyReferenceRegistry document
      const policyRegistry = await PolicyReferenceRegistry.findOne();
      if (!policyRegistry) {
        throw new Error('PolicyReferenceRegistry not found');
      }
      // Extract policies array from the document
      const authorisationPolicies = policyRegistry.policies;
      return authorisationPolicies as IAuthorisationPolicy[];
    } catch (error: any) {
      throw new Error(`Error fetching authorizations: ${error.message}`);
    }
  }

  // Generate policies based on permissions and constraint configuration.
  public genPolicies(permissions: any): IAuthorisationPolicy[] {
    const policies: IAuthorisationPolicy[] = [];
    // Iterate through each permission provided.
    for (const permission of permissions) {
      const policy: IAuthorisationPolicy = {
        // Set the subject of the policy to the '@type' property of the permission.
        subject: permission['@type'],
        // Set the action of the policy to the 'action' property of the permission.
        action: permission.action,
        conditions: {},
      };

      if (permission.constraint) {
        // Iterate through each constraint in the permission.
        for (const constraint of permission.constraint) {
          const condition: Record<string, any> = {};
          const leftOperand = constraint.leftOperand;
          if (leftOperand) {
            condition[leftOperand] = {};
            const operator: string | undefined = operators[constraint.operator];
            if (operator) {
              condition[leftOperand] = { [operator]: constraint.rightOperand };
            } else {
              logger.warn(`Operator ${operator} unsupported.`);
            }
          }
          // Merge the condition into the policy's conditions.
          Object.assign(policy.conditions, condition);
        }
      }
      // Add the policy to the list of generated policies.
      policies.push(policy);
    }
    // Return the generated policies.
    return policies;
  }

  // Add a new policy to the policy list
  public add(data: any): void {
    this.policies.push(data);
  }

  // Update an existing policy in the policy list by dbId
  public update(id: string, data: any): void {
    // Find the policy in the list based on its ID
    const index = this.policies.findIndex((policy: IAuthorisationPolicy) => {
      // Todo
      return false;
      // return policy.dbId === id;
    });
    if (index !== -1) {
      // Update the policy in the list
      this.policies[index] = data;
    }
  }

  // Remove a policy from the policy list by dbId
  public remove(id: string): void {
    // Find the policy in the list based on its dbId
    const index = this.policies.findIndex((policy: IAuthorisationPolicy) => {
      // Todo
      return false;
      // return policy.dbId === id;
    });
    if (index !== -1) {
      // Remove the policy from the list
      this.policies.splice(index, 1);
    }
  }

  // Fetch all policies from the policy list
  public fetch(): Promise<IAuthorisationPolicy[]> {
    return this.policiesPromise;
  }
}

export default PolicyProviderService.getInstance();
