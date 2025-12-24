import swaggerJsdoc, { Options } from 'swagger-jsdoc';

// Swagger definition - this is the metadata about your API
const options: Options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'SaveOurVotes API', // Your API name
      version: '1.0.0', // API version
      description:
        'API documentation for the Save Our Votes voting application',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Your local development server
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
    },
  },
  // Paths to files where Swagger comments are written
  apis: ['./src/Routes/*.ts'],
};

// Generate Swagger docs based on the options and JSDoc comments in your routes
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
