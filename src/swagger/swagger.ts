import { config } from 'config/config';
import swaggerAutogen from 'swagger-autogen';
const bilateralContractModel = {
  type: 'object',
  properties: {
    uid: { type: 'string' },
    dataProvider: { type: 'string' },
    dataConsumer: { type: 'string' },
    serviceOffering: { type: 'string' },
    profile: { type: 'string' },
    policy: { type: 'array' },
    purpose: { type: 'array' },
    signatures: { type: 'array' },
    revokedSignatures: { type: 'array' },
    negotiators: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          did: { type: 'string' },
        },
      },
    },
    status: {
      type: 'string',
      enum: ['signed', 'revoked', 'under_negotiation', 'pending'],
      default: 'pending',
    },
    terminationAndValidity: {
      type: 'object',
      properties: {
        effectiveDate: { type: 'string', format: 'date-time' },
        terminationPeriod: { type: 'string', format: 'date-time' },
      },
    },
    limitationOfLiability: { type: 'string', format: 'date-time' },
    termsAndConditions: { type: 'string' },
    jsonLD: { type: 'string' },
  },
  required: ['dataProvider', 'dataConsumer'],
};

const contractModel = {
  type: 'object',
  properties: {
    uid: { type: 'string' },
    ecosystem: { type: 'string' },
    orchestrator: { type: 'string' },
    rolesAndObligations: {
      type: 'array',
    },
    members: {
      type: 'array',
    },
    revokedMembers: {
      type: 'array',
    },
    status: {
      type: 'string',
      enum: ['signed', 'revoked', 'pending'],
      default: 'pending',
    },
    jsonLD: { type: 'string' },
  },
  required: ['ecosystem'],
};
const doc = {
  info: {
    title: 'Contract Manager API',
    description: 'Availables routes through the Contract Manager API',
  },
  host: `${config.server.port}`,
  schemes: ['http'],
  definitions: {
    Policy: {
      name: { type: 'string' },
      description: { type: 'string' },
      requestedFields: { type: 'array', items: { type: 'string' } },
      policy: { type: 'object' },
    },
    ODRLPolicy: {},
    User: {},
    PolicyList: [{}],
    Error: { message: { type: 'string' } },
    VerificationResult: { type: 'boolean' },
    ExploitabilityResult: { type: 'boolean' },
    LoginResult: { token: { type: 'string' } },
    SuccessMessage: { message: { type: 'string' } },
    InvalidPolicies: [{}],
    ContractsList: { type: 'array', items: { $ref: '#/definitions/Contract' } },
    Asset: {
      type: 'object',
      properties: {
        target: { type: 'string' },
        action: { type: 'string' },
        condition: { type: 'array' },
        required: ['target', 'action'],
      },
    },
    InputContract: {
      ecosystem: { type: 'string' },
      permission: { type: 'array', items: { $ref: '#/definitions/Asset' } },
      prohibition: { type: 'array', items: { $ref: '#/definitions/Asset' } },
      required: ['ecosystem'],
    },
    Bilateral: bilateralContractModel,
    Contract: contractModel,
    ODRLContract: {},
    PolicyBilateralInjection: {
      ruleId: 'string',
      values: { type: 'object' },
    },
    PolicyInjection: {
      role: 'string',
      ruleId: 'string',
      values: { type: 'object' },
    },
    PolicyRoleInjection: {
      ruleId: 'string',
      values: { type: 'object' },
    },
    Signature: {
      participant: { type: 'string' },
      role: { type: 'string' },
      signature: { type: 'string' },
    },
  },
};
const outputFile: string = './swagger.json';
const endpointsFiles: string[] = [
  '../routes/**/*.ts',
  './user.swagger.ts',
  './contract.swagger.ts',
  './bilateral.swagger.ts',
];
const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles, doc);
