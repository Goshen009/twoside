import fp from "fastify-plugin";
import { z } from "zod/v4";

const Environment = z.enum(['local', 'preview', 'beta']);

const Schema = z.object({
	ENVIRONMENT: Environment,
	DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  ZEPTO_TOKEN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
});

export type Config = z.infer<typeof Schema>;
export type Environments = z.infer<typeof Environment>;

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