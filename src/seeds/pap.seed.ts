import { IRule } from 'interfaces/policy.interface';
import Policy from 'models/rule.model';

const policies: IRule[] = [
  // Machine readable
  {
    name: 'Machine readable',
    description:
      'MUST describe their organisations and service offerings in a machine readable format and human readable',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'machineReadable',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Terms of use
  {
    name: 'Terms of use',
    description: 'MUST define clear data set terms of use',
    policy: {
      permission: [
        {
          target: '@{target}',
          action: 'use',
          constraint: [
            {
              leftOperand: 'termsOfUse',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Consent
  {
    name: 'Consent',
    description:
      'MUST accept and comply with requests from the person on data sharing, consent and GDPR rights',
    policy: {
      action: 'use',
      target: '@{target}',
      permission: [
        {
          constraint: [
            {
              leftOperand: 'acceptTracking',
              operator: 'eq',
              rightOperand: true,
            },
            {
              leftOperand: 'rgpdCompliant',
              operator: 'eq',
              rightOperand: true,
            },
            {
              leftOperand: 'userConsent',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Personal data intermediary
  {
    name: 'Personal data intermediary',
    description:
      'MUST accept Personal Data Intermediary as valid representation of people',
    policy: {
      permission: [
        {
          target: '@{target}',
          action: 'use',
          constraint: [
            {
              leftOperand: 'PersonalDataIntermediary',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Pricing
  {
    name: 'Pricing',
    description: 'MUST define pricing and value sharing on the use of the data',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'annotate',
              operator: 'eq',
              rightOperand: true,
            },
            {
              leftOperand: 'Pricing',
              operator: 'eq',
              rightOperand: true,
            },
            {
              leftOperand: 'ValueSharing',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  //
  // Governance Rules
  {
    name: 'Governance Rules',
    description: 'MUST define the precise governance rules',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'fileType',
              operator: 'eq',
              rightOperand: '@{fileType}',
            },
            {
              leftOperand: 'createdDate',
              operator: 'gt',
              rightOperand: '@{createdDate}',
            },
          ],
        },
      ],
    },
    requestedFields: ['target', 'fileType', 'createdDate'],
  },
  // Non-Participation Clause
  {
    name: 'Non-Participation Clause',
    description: 'CAN NOT be service or data provider or end user',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'role',
              operator: 'in',
              rightOperand: ['service', 'dataProvider', 'endUser'],
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Comprehensive Data Policy
  {
    name: 'Comprehensive Data Policy',
    description:
      'MUST define clear data policies stating what data is used, for which purposes, the security measures, the third parties it is shared with, if there is an advertisement model in a human and machine readable way',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'purpose',
              operator: 'isAnyOf',
              rightOperand: '@{purpose}',
            },
            {
              leftOperand: 'securityMeasures',
              operator: 'isAnyOf',
              rightOperand: ['?', '?'],
            },
            {
              leftOperand: 'thirdParties',
              operator: 'isAnyOf',
              rightOperand: ['?', '?'],
            },
            {
              leftOperand: 'advertisementModel',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Pricing Clarity
  {
    name: 'Pricing Clarity',
    description: 'MUST define pricing / value sharing on use of services',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'pricing',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // AI Usage Transparency
  {
    name: 'AI Usage Transparency',
    description: 'MUST inform if AI is used in the product',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'aiUsage',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Data Terms Compliance
  {
    name: 'Data Terms Compliance',
    description: 'MUST respect data set terms & conditions',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'dataTermsCompliance',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  //
  {
    name: 'AI Risk Disclosure',
    description: 'MUST describe risks and safegaurds on AI',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'aiRiskDisclosure',
              operator: 'eq',
              rightOperand: true,
            },
          ],
        },
      ],
    },
    requestedFields: ['target'],
  },
  //
  // No restriction
  {
    name: 'No Restriction',
    description: 'CAN use data without any restrictions',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [],
        },
      ],
    },
    requestedFields: ['target'],
  },
  // Time interval
  {
    name: 'Time Interval',
    description: 'MUST use data within a specified time interval',
    policy: {
      permission: [
        {
          action: 'use',
          target: 'http://provider/service',
          constraint: [
            {
              leftOperand: 'dateTime',
              operator: 'lt',
              rightOperand: '@{firstDate}',
            },
            {
              leftOperand: 'dateTime',
              operator: 'gt',
              rightOperand: '@{lastDate}',
            },
          ],
        },
      ],
    },
    requestedFields: ['target', 'firstDate', 'lastDate'],
  },
  // Time period
  {
    name: 'Time Period',
    description: 'MUST use data for a specified time period',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'dateTime',
              operator: 'gte',
              rightOperand: '@{dateBegin}',
            },
            {
              leftOperand: 'dateTime',
              operator: 'lte',
              rightOperand: '@{dateEnd}',
            },
          ],
        },
      ],
    },
    requestedFields: ['target', 'dateBegin', 'dateEnd'],
  },
  // Count
  {
    name: 'Count',
    description: 'MUST not use data for more than n times',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'count',
              operator: 'lte',
              rightOperand: '@{value}',
            },
          ],
        },
      ],
    },
    requestedFields: ['target', 'value'],
  },
  // Within a time interval
  {
    name: 'Within a time interval',
    description:
      'MUST use data within a specified time interval and MUST delete the data at the specified time stamp',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'dateTime',
              operator: 'gte',
              // YYYY-MM-DDTHH:MM:SSZ
              rightOperand: '@{dateBegin}',
            },
            {
              leftOperand: 'dateTime',
              operator: 'lte',
              rightOperand: '@{dateEnd}',
            },
          ],
        },
        /*
        {
          action: 'delete',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'dateTime',
              operator: 'eq',
              rightOperand: '',
            },
          ],
        },
        */
      ],
    },
    requestedFields: ['target', 'dateBegin', 'dateEnd'],
  },
  // Notification message
  {
    name: 'Notification message',
    description: 'CAN use data with notification message',
    policy: {
      permission: [
        {
          action: 'use',
          target: '@{target}',
          constraint: [
            {
              leftOperand: 'notificationMessage',
              operator: 'eq',
              rightOperand: '@{value}',
            },
          ],
        },
      ],
    },
    requestedFields: ['target', 'value'],
  },
];

export async function seedPolicies() {
  try {
    await Policy.deleteMany({});
    await Policy.insertMany(policies);
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
