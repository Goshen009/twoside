import fp from "fastify-plugin";
import cors from '@fastify/cors';

export default fp(async (fastify) => {
  // this should be after cors error
  fastify.register(cors, {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
      ];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
}, {
  name: 'cors',
  dependencies: ['error-handler']
});