import { PrismaClient } from "#/prisma/client.js";
// import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import fp from "fastify-plugin"

export default fp(async (fastify) => {
  // const adapter = new PrismaNeon({
  //   connectionString: fastify.config.DATABASE_URL
  // });

  const adapter = new PrismaPg({
    connectionString: fastify.config.DATABASE_URL,
    max: 20
  });

  const prisma = new PrismaClient({ adapter });

  fastify.decorate('prisma', prisma);
}, {
  name: 'db',
  dependencies: ['env']
});

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient
  }
}