import cors from '@fastify/cors';
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.register(cors, {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://192.168.1.200:5173'
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