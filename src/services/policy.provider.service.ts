import { AuthorizationPolicy } from './pdp.service';
import { logger } from 'utils/logger';
import contractConfig, {
  IConstraints,
  IConstraint,
} from 'config/contrat.config';

// Policy Provider Service
class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policies: AuthorizationPolicy[];

  private constructor() {
    // Initialize the singleton, if needed
    this.policies = [
      // Temporary default static policies for testing
      {
        subject: 'is-it-alive',
        action: 'GET',
        conditions: {},
      },
      // Bilateral contrat default authorisation rules
      {
        subject: 'bilateral',
        action: 'GET',
        conditions: {},
      },
      {
        subject: 'bilateral',
        action: 'POST',
        conditions: {
          participant: 'admin',
        },
      },
      {
        subject: 'bilateral',
        action: 'PUT',
        conditions: {
          participant: 'admin',
        },
      },
      {
        subject: 'bilateral',
        action: 'DELETE',
        conditions: {
          participant: 'admin',
        },
      },
      // Contract default authorisation rules
      {
        subject: 'contract',
        action: 'GET',
        conditions: {},
      },
      {
        subject: 'contract',
        action: 'POST',
        conditions: {
          participant: 'admin',
        },
      },
      {
        subject: 'contract',
        action: 'PUT',
        conditions: {
          participant: 'admin',
        },
      },
      {
        subject: 'contract',
        action: 'DELETE',
        conditions: {
          participant: 'admin',
        },
      },
      // User default authorisation rules
      {
        subject: 'user',
        action: 'GET',
        conditions: {
          task: 'login',
        },
      },
    ];
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
  }

  // Generate policies based on permissions and constraint configuration.
  public genPolicies(permissions: any): AuthorizationPolicy[] {
    const policies: AuthorizationPolicy[] = [];
    // Iterate through each permission provided.
    for (const permission of permissions) {
      const policy: AuthorizationPolicy = {
        // Set the subject of the policy to the '@type' property of the permission.
        subject: permission['@type'],
        // Set the action of the policy to the 'action' property of the permission.
        action: permission.action,
        conditions: {},
      };

      if (permission.constraint) {
        const constraintConfig: IConstraints = contractConfig.constraint;
        // Iterate through each constraint in the permission.
        for (const constraint of permission.constraint) {
          // Determine the type of the constraint based on '@type'.
          const constraintType = constraint[
            '@type'
          ] as keyof typeof constraintConfig.constraint;

          // Get the configuration for this constraint type.
          const constraintTypeConfig: IConstraint =
            contractConfig.constraint[constraintType];

          if (constraintTypeConfig) {
            const condition: Record<string, any> = {};
            const parent: string = constraintTypeConfig.field;

            if (typeof constraintTypeConfig.operator === 'string') {
              // Handle constraints with single operator ($eq).
              for (const key in constraint) {
                if (key !== '@type') {
                  condition[`${parent}.${key}`] = constraint[key];
                }
              }
            } else {
              condition[constraintTypeConfig.field] = {};
              const leftField: string | undefined =
                constraintTypeConfig.leftField;

              if (leftField) {
                // Handle constraints with multiple operators.
                const operator: string | undefined =
                  constraintTypeConfig.operator[constraint.operator];

                if (operator) {
                  const field: any = condition[constraintTypeConfig.field];
                  const rightField: string | undefined =
                    constraintTypeConfig.rightField;

                  if (rightField) {
                    field[operator] = constraint[rightField];
                  }
                } else {
                  logger.warn(
                    `Operator not supported in this constraint type: ${constraintType}`,
                  );
                }
              }
            }
            // Merge the condition into the policy's conditions.
            Object.assign(policy.conditions, condition);
          } else {
            // Log a warning for unsupported constraint types.
            logger.warn(`Unsupported constraint type: ${constraintType}`);
          }
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
    const index = this.policies.findIndex((policy: AuthorizationPolicy) => {
      return policy.dbId === id;
    });
    if (index !== -1) {
      // Update the policy in the list
      this.policies[index] = data;
    }
  }

  // Remove a policy from the policy list by dbId
  public remove(id: string): void {
    // Find the policy in the list based on its dbId
    const index = this.policies.findIndex((policy: AuthorizationPolicy) => {
      return policy.dbId === id;
    });
    if (index !== -1) {
      // Remove the policy from the list
      this.policies.splice(index, 1);
    }
  }

  // Fetch all policies from the policy list
  public fetch(): AuthorizationPolicy[] {
    return this.policies;
  }
}

export default PolicyProviderService.getInstance();
