import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'contract-manager',
      description: '...',
      version: '1.0.0',
    },
  },
  apis: [`${__dirname}/routes/*.ts`],
};

export default swaggerJsdoc(options);
