import { IPolicyInjection } from 'interfaces/policy.interface';
import { replaceValues } from 'utils/utils';
import axios, { AxiosError } from 'axios';
import { config } from 'config/config';
import { logger } from 'utils/logger';

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

export const genPolicyFromRule = async ({
  ruleId,
  values,
}: IPolicyInjection): Promise<any> => {
  try {
    const catalogUrl = config.catalog.registry.url.replace(/\/$/, '');
    const fileExt = config.catalog.registry.fileExt as string;
    const ruleUrl = catalogUrl.includes('static')
      ? `${catalogUrl}/${ruleId}.json`
      : `${catalogUrl}/${ruleId}${fileExt?.length > 0 ? `.${fileExt}` : ''}`;

    const { data: rule } = await axios.get(ruleUrl);
    replaceValues(rule.policy, values);

    rule.policy.description =
      Array.isArray(rule.description) && rule.description.length > 0
        ? rule.description[0]['@value']
        : typeof rule.description === 'string'
          ? rule.description
          : '';
    return rule.policy;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const url = error.config?.url;
      const message = `[contract/genPolicyFromRule] Error ${status}: ${
        error.message
      }${url ? ` for URL: ${url}` : ''}`;
      logger.error(message);
      throw new Error(message);
    } else {
      const message = `[contract/genPolicyFromRule] Unexpected error: ${
        (error as Error).message
      }`;
      logger.error(message);
      throw new Error(message);
    }
  }
};
