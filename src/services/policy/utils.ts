import {
  IAuthorisationPolicy,
  ICondition,
  IPolicyInjection,
} from 'interfaces/policy.interface';
import { logger } from 'utils/logger';
import { PDPAction } from 'interfaces/policy.interface';
import { replaceValues } from 'utils/utils';
import axios from 'axios';
import { config } from 'config/config';

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

///
export const mergeConditions = (
  authorisations: IAuthorisationPolicy[],
): IAuthorisationPolicy[] => {
  const conditions: Record<string, ICondition> = {};

  authorisations.forEach(({ subject, action, conditions: authConditions }) => {
    const key = JSON.stringify({
      subject,
      action,
    });

    conditions[key] = conditions[key] || {};
    Object.entries(authConditions).forEach(([conditionKey, conditionValue]) => {
      conditions[key][conditionKey] = Array.isArray(
        conditions[key][conditionKey],
      )
        ? [...(conditions[key][conditionKey] as []), ...(conditionValue as [])]
        : {
            ...(conditions[key][conditionKey] as ICondition),
            ...(conditionValue as ICondition),
          };
    });
  });

  const mergedAuthorisations: IAuthorisationPolicy[] = Object.entries(
    conditions,
  ).map(([key, mergedConditions]) => {
    const { subject, action } = JSON.parse(key);
    return {
      subject,
      action,
      conditions: mergedConditions,
    };
  }) as IAuthorisationPolicy[];

  return mergedAuthorisations;
};

export const genPolicyFromRule = async (
  injection: IPolicyInjection,
): Promise<any> => {
  try {
    const ruleId = injection.ruleId;
    const replacement = injection.values;
    const catalogUrl = config.catalog.registry.url.replace(/\/$/, '');
    const ruleUrl = `${catalogUrl}/${ruleId}.json`;
    const response = await axios.get(ruleUrl);
    const rule = response.data;
    replaceValues(rule.policy, replacement);
    rule.policy.description =
      rule.description &&
      Array.isArray(rule.description) &&
      rule.description.length > 0
        ? rule.description[0]['@value']
        : typeof rule.description === 'string'
        ? rule.description
        : '';
    return rule.policy;
  } catch (error: any) {
    const response = error.response;
    const status = response?.status;
    const message = `[contract/genPolicyFromRule] ${error.message} ${
      status ? `url: ${error.response.config.url}` : ''
    }`;
    throw new Error(message);
  }
};
