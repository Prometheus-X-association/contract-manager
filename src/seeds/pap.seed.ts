import { IPolicy } from 'interfaces/policy.interface';
import Policy from 'models/policy.model';

interface IPolicyJson extends Omit<IPolicy, '_id'> {
  jsonLD: any;
}

const policies: IPolicyJson[] = [
  // Machine readable
  {
    name: 'Machine readable',
    description:
      'MUST describe their organisations and service offerings in a machine readable format and human readable',
    jsonLD: {
      permission: {
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
    },
  },
  // Terms of use
  {
    name: 'Terms of use',
    description: 'MUST define clear data set terms of use',
    jsonLD: {
      permission: {
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
    },
  },
  // Consent
  {
    name: 'Consent',
    description:
      'MUST accept and comply with requests from the person on data sharing, consent and GDPR rights',
    jsonLD: {
      action: 'use',
      target: '@{target}',
      permission: {
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
    },
  },
  // Personal data intermediary
  {
    name: 'Personal data intermediary',
    description:
      'MUST accept Personal Data Intermediary as valid representation of people',
    jsonLD: {
      permission: {
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
    },
  },
  // Pricing
  {
    name: 'Pricing',
    description: 'MUST define pricing and value sharing on the use of the data',
    jsonLD: {
      '@context': 'https://www.w3.org/ns/odrl.jsonld',
      '@type': 'Offer',
      action: 'use',
      target: 'http://provider/service',
      permission: {
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
    },
  },
  //
  // MUST define the precise governance rules
  // CAN NOT be service or data provider or end user
  // MUST define clear data policies stating what data is used, for which purposes, the security measures, the third parties it is shared with, if there is an advertisement model in a human and machine readable way
  // MUST define pricing / value sharing on use of services
  // MUST inform if AI is used in the product
  // MUST respect data set terms & conditions
  // MUST describe risks and safegaurds on AI
  //
  // No restriction
  {
    name: 'No restriction',
    description: 'CAN use data without any restrictions',
    jsonLD: {
      permission: {
        action: 'use',
        target: '@{target}',
        constraint: [],
      },
    },
  },
  // Time interval
  {
    name: 'Time interval',
    description: 'MUST use data within a specified time interval',
    jsonLD: {
      permission: {
        action: 'use',
        target: '@{target}',
        constraint: [],
      },
    },
  },
  // Time period
  {
    name: 'Time period',
    description: 'MUST use data for a specified time period',
    jsonLD: {
      permission: {
        action: 'use',
        target: '@{target}',
        constraint: [],
      },
    },
  },
  // Count
  {
    name: 'Count',
    description: 'MUST not use data for more than n times',
    jsonLD: {
      permission: {
        action: 'use',
        target: '@{target}',
        constraint: [],
      },
    },
  },
  // Within a time interval
  {
    name: 'Within a time interval',
    description:
      'MUST use data within a specified time interval and MUST delete the data at the specified time stamp',
    jsonLD: {
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
  },
  // Notification message
  {
    name: 'Notification message',
    description: 'CAN use data with notification message',
    jsonLD: {
      permission: {
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
    },
  },
];

export async function seedPolicies() {
  const policiesData: Omit<IPolicy, '_id'>[] = policies.map((policy) => ({
    name: policy.name,
    description: policy.description,
    jsonLD: JSON.stringify(policy.jsonLD),
  }));

  try {
    await Policy.deleteMany({});
    await Policy.insertMany(policiesData);
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
