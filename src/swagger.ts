import swaggerAutogen from 'swagger-autogen';

const outputFile: string = './swagger.json';
const endpointsFiles: string[] = ['./routes/**/*.ts'];
const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles);
