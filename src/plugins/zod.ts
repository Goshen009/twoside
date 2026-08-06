import fp from 'fastify-plugin';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';

export default fp(async (fastify) => {
  // Tell Fastify how to validate schemas
  fastify.setValidatorCompiler(validatorCompiler)

  // Tell Fastify how to serialize responses
  fastify.setSerializerCompiler(serializerCompiler)
});