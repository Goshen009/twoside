import fp from "fastify-plugin";
import { z } from "zod/v4";

const Schema = z.object({
	ENVIRONMENT: z.enum(['development', 'production', 'staging']),
	DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

export type Config = z.infer<typeof Schema>;

export default fp(
  async (fastify) => {
 		const result = Schema.safeParse(process.env);
    
    if (!result.success) {
    	// TODO: It never crossed my mind that in addition to CI
     	// I could just have this make a call to an hardcoded thingy -- if possible.
      fastify.log.error(z.treeifyError(result.error));
      process.exit(1);
    }
  
    fastify.decorate('config', result.data);
  },
  { name: "env" },
);

declare module "fastify" {
  export interface FastifyInstance {
    config: Config;
  }
}