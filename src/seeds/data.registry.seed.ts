import DataRegistry from 'models/data.registry.model';

// Temporary bilateral contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const bilateralModelSeedling: any = {
  '@context': 'http://www.w3.org/ns/odrl.jsonld',
  '@type': 'Agreement',
  '@id': 'DID:123',
  uri: 'http://example.com/contract/123',
  uid: '123',
  profile: 'http://example.com/profiles/data-exchange',
  permission: [
    {
      '@type': 'Offer',
      target: '',
      assigner: '',
      assignee: '',
      action: '',
      data: '',
      constraint: '',
    },
  ],
  data: [
    {
      '@type': 'Data',
      uid: '',
      type: '',
      purpose: '',
    },
  ],
  purpose: [
    {
      '@type': 'Purpose',
      uid: '',
      purpose: '',
      action: '',
      assigner: '',
      assignee: '',
      purposeCategory: '',
      consentType: '',
      piiCategory: '',
      primaryPurpose: '',
      termination: '',
      thirdPartyDisclosure: '',
      thirdPartyName: '',
    },
  ],
  signatures: [
    {
      '@type': 'Signature',
      party: 'Participant A VC token or whatever',
      value: 'Participant A, digital signature',
    },
    {
      '@type': 'Signature',
      party: 'Participant B VC token or whatever',
      value: 'Participant B, digital signature',
    },
  ],
  spiCat: '',
};
// Temporary ecoSystem contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const ecoSystemModelSeedling: any = {
  '@context': 'http://www.w3.org/ns/odrl.jsonld',
  '@type': 'Agreement',
  '@id': 'DID:123',
  uri: 'http://example.com/contract/123',
  uid: '123',
  profile: 'http://example.com/profiles/data-exchange',
  permission: [
    {
      '@type': 'Offer',
      target: '',
      assigner: '',
      assignee: '',
      action: '',
      data: '',
      constraint: '',
    },
  ],
  data: [
    {
      '@type': 'Data',
      uid: '',
      type: '',
      purpose: '',
    },
  ],
  purpose: [
    {
      '@type': 'Purpose',
      uid: '',
      purpose: '',
      action: '',
      assigner: '',
      assignee: '',
      purposeCategory: '',
      consentType: '',
      piiCategory: '',
      primaryPurpose: '',
      termination: '',
      thirdPartyDisclosure: '',
      thirdPartyName: '',
    },
  ],
  signatures: [
    {
      '@type': 'Signature',
      party: 'Participant A VC token or whatever',
      value: 'Participant A, digital signature',
    },
    {
      '@type': 'Signature',
      party: 'Participant B VC token or whatever',
      value: 'Participant B, digital signature',
    },
  ],
  spiCat: '',
};

// ODRL Validtaion Schemas
const odrlValidationSchema = [
  // Permission as Object
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
                  oneOf: [
                    { type: 'boolean' },
                    { type: 'number' },
                    { type: 'string' },
                    {
                      type: 'object',
                      properties: {
                        '@value': { type: 'string' },
                        '@type': { type: 'string' },
                      },
                      required: ['@value', '@type'],
                    },
                  ],
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
  // Permission & Prohibition
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
            target: { type: 'string' },
            action: { type: 'string' },
            assigner: { type: 'string' },
            assignee: { type: 'string' },
          },
          required: ['target', 'action', 'assigner', 'assignee'],
        },
      },
      prohibition: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            target: { type: 'string' },
            action: { type: 'string' },
            assigner: { type: 'string' },
            assignee: { type: 'string' },
          },
          required: ['target', 'action', 'assigner', 'assignee'],
        },
      },
      constraint: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            leftOperand: { type: 'string' },
            operator: { type: 'string' },
            rightOperand: {
              oneOf: [
                { type: 'boolean' },
                { type: 'number' },
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    '@value': { type: 'string' },
                    '@type': { type: 'string' },
                  },
                  required: ['@value', '@type'],
                },
              ],
            },
          },
          required: ['leftOperand', 'operator', 'rightOperand'],
        },
      },
    },
    required: ['@context', '@type'],
    anyOf: [
      { required: ['permission', 'prohibition'] },
      { required: ['permission', 'constraint'] },
    ],
    additionalProperties: false,
  },
  // Prohibition as Array
  {
    type: 'object',
    properties: {
      '@context': { type: 'string' },
      '@type': { type: 'string' },
      prohibition: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            target: { type: 'string' },
            action: { type: 'string' },
            assigner: { type: 'string' },
            assignee: { type: 'string' },
          },
          required: ['target', 'action', 'assigner', 'assignee'],
        },
      },
    },
    required: ['@context', '@type', 'prohibition'],
    additionalProperties: false,
  },
  // Permission as Array
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
                    oneOf: [
                      { type: 'boolean' },
                      { type: 'number' },
                      { type: 'string' },
                      {
                        type: 'object',
                        properties: {
                          '@value': { type: 'string' },
                          '@type': { type: 'string' },
                        },
                        required: ['@value', '@type'],
                      },
                    ],
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
  /*
  // Using profile
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
                    oneOf: [
                      { type: 'boolean' },
                      { type: 'number' },
                      { type: 'string' },
                      {
                        type: 'object',
                        properties: {
                          '@value': { type: 'string' },
                          '@type': { type: 'string' },
                        },
                        required: ['@value', '@type'],
                      },
                    ],
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
  // Using refinement
  {
    type: 'object',
    properties: {
      '@context': { type: 'string' },
      '@type': { type: 'string' },
      uid: { type: 'string' },
      profile: { type: 'string' },
      permission: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            target: { type: 'string' },
            assigner: { type: 'string' },
            action: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  'rdf:value': { type: 'object' },
                  refinement: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        leftOperand: { type: 'string' },
                        operator: { type: 'string' },
                        rightOperand: {
                          anyOf: [{ type: 'string' }, { type: 'object' }],
                        },
                        unit: { type: 'string' },
                      },
                      required: [
                        'leftOperand',
                        'operator',
                        'rightOperand',
                        'unit',
                      ],
                    },
                  },
                },
                required: ['rdf:value', 'refinement'],
              },
            },
          },
          required: ['target', 'assigner', 'action'],
        },
      },
    },
    required: ['@context', '@type', 'uid', 'profile', 'permission'],
  },
  */
];

export async function seedDataRegistry() {
  try {
    await DataRegistry.deleteMany({});
    const seedDocument = new DataRegistry({
      contracts: {
        bilateral: JSON.stringify(bilateralModelSeedling),
        ecosystem: JSON.stringify(ecoSystemModelSeedling),
      },
      policies: {
        odrlValidationSchema: JSON.stringify(odrlValidationSchema),
      },
    });
    await seedDocument.save();
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
