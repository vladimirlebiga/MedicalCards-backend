const swaggerOptions = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Medical Cards API',
        version: '1.0.0',
        description: 'Medical Cards API with Swagger docs',
      },
      servers: [{ url: 'http://localhost:3000/api' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', format: 'password' },
              name: { type: 'string' },
            },
            required: ['id', 'email', 'password', 'name'],
          },
          Error: {
            type: 'object',
            properties: { message: { type: 'string' } },
            required: ['message'],
          },
        },
      },
    },
    // globs for files that contain JSDoc @openapi annotations
    apis: ['./src/controller/routes/**/*.js', './src/server.js'],
  };

  module.exports = swaggerOptions;