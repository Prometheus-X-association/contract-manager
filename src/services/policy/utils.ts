import { IPolicyInjection } from 'interfaces/policy.interface';
import { replaceValues } from 'utils/utils';
import axios from 'axios';
import { config } from 'config/config';

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

export const genPolicyFromRule = async (
  injection: IPolicyInjection,
): Promise<any> => {
  try {
    const ruleId = injection.ruleId;
    const replacement = injection.values;
    const catalogUrl = config.catalog.registry.url.replace(/\/$/, '');
    let ruleUrl: string;
    if (catalogUrl.includes('static')) {
      ruleUrl = `${catalogUrl}/${ruleId}.json`;
    } else {
      ruleUrl = `${catalogUrl}/${ruleId}`;
      if ((config.catalog.registry.fileExt as string)?.length > 0) {
        ruleUrl = `${ruleUrl}.${config.catalog.registry.fileExt}`;
      }
    }
    const response = await axios.get(ruleUrl);
    const rule = response.data;
    replaceValues(rule.policy, replacement);
    let description = '';
    if (
      rule.description &&
      Array.isArray(rule.description) &&
      rule.description.length > 0
    ) {
      description = rule.description[0]['@value'];
    } else if (typeof rule.description === 'string') {
      description = rule.description;
    }
    rule.policy.description = description;
    return rule.policy;
  } catch (error: any) {
    const message = `[contract/genPolicyFromRule] ${error.message} url: ${error.response}`;
    throw new Error(message);
  }
};
