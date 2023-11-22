import { config } from 'config/config';
import swaggerAutogen from 'swagger-autogen';
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
    ContractsList: [{}],
    InputContract: {
      permission: [],
      prohibition: [],
    },
    Contract: { type: 'Contract' },
    ODRLContract: {},
    PolicyInjection: {},
    PoliciesInjections: [{ type: 'PolicyInjection' }],
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
