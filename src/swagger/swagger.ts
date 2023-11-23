import { config } from 'config/config';
import swaggerAutogen from 'swagger-autogen';
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
    Policy: {},
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
    Contract: contractModel,
    ODRLContract: {},
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
  './pap.swagger.ts',
  './user.swagger.ts',
  './contract.swagger.ts',
];
const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles, doc);
