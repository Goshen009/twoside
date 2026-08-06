import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  fastify.withTypeProvider<ZodTypeProvider>();

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'guards'),
    options: opts
  });

  await fastify.register(routes);
}

export default app
export { app, options }
