import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import { logger } from 'utils/logger';

// temporary odrl policy schema to put in data base
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

type ConditionValue = boolean | number | string;
export const getValueFromXSD = (operand: any): ConditionValue => {
  if (typeof operand === 'object' && '@type' in operand) {
    switch (operand['@type']) {
      case 'xsd:boolean':
        return operand['@value'] === 'true';
      case 'xsd:integer':
      case 'xsd:double':
        return parseFloat(operand['@value']);
      default:
        return operand['@value'];
    }
  } else {
    return operand;
  }
};

// Generate internal policies based on constraint configurations
// derived from the contract's permissions, prohibitions, or duties.
export const genPolicies = (
  permissions: unknown | undefined,
): IAuthorisationPolicy[] => {
  const policies: IAuthorisationPolicy[] = [];
  // Iterate through each permission provided.
  if (permissions !== undefined) {
    for (const permission of permissions as any) {
      const policy: IAuthorisationPolicy = {
        // Set the subject of the policy to the 'target' property of the permission.
        subject: permission.target,
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
              condition[leftOperand] = {
                [operator]: getValueFromXSD(constraint.rightOperand),
              };
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
  }
  // Return the generated policies.
  return policies;
};

// Generate internal policies based on constraint configurations
// derived from the contract's permissions, prohibitions, or duties.
// This method focuses on generating policies based on input values without considering operators in constraints.
export const genInputPolicies = (
  permissions: unknown | undefined,
): IAuthorisationPolicy[] => {
  const policies: IAuthorisationPolicy[] = [];
  if (permissions !== undefined) {
    for (const permission of permissions as any) {
      const policy: IAuthorisationPolicy = {
        subject: permission.target,
        action: permission.action,
        conditions: {},
      };
      if (permission.constraint) {
        for (const constraint of permission.constraint) {
          const leftOperand = constraint.leftOperand;

          if (leftOperand) {
            const condition: Record<string, any> = {
              [leftOperand]: constraint.rightOperand,
            };
            Object.assign(policy.conditions, condition);
          }
        }
      }
      policies.push(policy);
    }
  }
  return policies;
};

// Retrieve permissions and prohibitions constraints from the contract and input policy
export const buildConstraints = (reference: any, input: any): any[] => {
  const permissionsConstraint = {
    // Permissions constraints from the reference policy
    reference: reference.permission || [],
    // Permissions constraints from the input policy
    input: input.permission || [],
    // Indicator that these are permissions (can)
    cannot: false,
  };
  const prohibitionsConstraint = {
    // Prohibitions constraints from the reference policy
    reference: reference.prohibition || [],
    // Prohibitions constraints from the input policy
    input: input.prohibition || [],
    // Indicator that these are prohibitions (cannot)
    cannot: true,
  };
  // Combine permissions and prohibitions constraints for unified processing
  return [permissionsConstraint, prohibitionsConstraint];
};

export const genConditions = (autorisations: IAuthorisationPolicy[]) =>
  autorisations.map((authorisation: IAuthorisationPolicy) => {
    const auth = { ...authorisation };
    if (auth?.conditions) {
      auth.conditions = Object.fromEntries(
        Object.entries(auth.conditions).map(([key, value]) => {
          return [key, 0];
        }),
      );
    }
    return auth;
  });
