import { Environments } from './env.js';
import cors from '@fastify/cors';
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.register(cors, {
    origin: (origin, callback) => {
     	if (fastify.config.ENVIRONMENT === 'local' || !origin)
      	return callback(null, true);

	    const CORS_ORIGINS: Record<Environments, string[]> = {
		    local:   [],
	      preview: ['https://preview.myapp.com'],
	      beta:    ['https://beta.myapp.com'],
	    };
    
      const allowed = CORS_ORIGINS[fastify.config.ENVIRONMENT];
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
}, {
  name: 'cors',
  dependencies: ['env', 'error-handler']
});