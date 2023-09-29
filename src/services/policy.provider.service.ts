import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import PolicyReferenceRegistry from 'models/policy.reference.registry.model';
import { logger } from 'utils/logger';
import contractConfig, {
  IConstraints,
  IConstraint,
} from 'config/contrat.config';

// Policy Provider Service
class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policies: IAuthorisationPolicy[];
  private policiesPromise: Promise<IAuthorisationPolicy[]>;

  private constructor() {
    this.policies = [];
    this.policiesPromise = this.fetchAuthorisationPolicies();
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
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
