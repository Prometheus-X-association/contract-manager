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
    Error: { message: { type: 'string' } },
    ODRLPolicy: {},
    PolicyList: [{}],
    VerificationResult: { type: 'boolean' },
  },
};
const outputFile: string = './swagger.json';
const endpointsFiles: string[] = ['./routes/**/*.ts', './pap.swagger.ts'];
const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles, doc);
