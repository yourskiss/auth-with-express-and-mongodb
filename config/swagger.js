import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API documentation',
      version: '1.0.0',
      description: 'API documentation for your Express app'
    },
    servers: [
      { url: process.env.BASE_URL }
    ]
  },
  apis: ['./docs/swaggerComments.js'] // Path to your route files
};
const specs = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

 