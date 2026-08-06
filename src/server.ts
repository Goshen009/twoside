import closeWithGrace from 'close-with-grace'
import config from './app.js';
import Fastify from 'fastify'
import Pino from 'pino';
import "dotenv/config";

const is_dev_environment = process.env.ENVIRONMENT === 'development';

const app = Fastify({
  logger: is_dev_environment ? {
   	level: 'debug',
 		transport: {
      target: 'pino-pretty',
    }
  } : {
  	level: 'info',
   	timestamp: Pino.stdTimeFunctions.isoTime,
 		transport: {
    	targets: [
        {
          target: 'pino/file',
          options: { destination: 1, sync: false }
        },
        // enable this if you want to write to a file
        // {
        // 	target: 'pino-roll',
        // 	options: {
       	// 		file: '/app/logs/app.log',
        //   	frequency: 'daily',
        //     size: '10m',        // also rotate if hits 10MB before daily
        //     dateFormat: 'yyyy-MM-dd',
        //     limit: { count: 7 }, // keep 7 rotated files + 1 active
        //     mkdir: true
        //  	}
        // }
      ]
    }
  },
  pluginTimeout: 10000,
  trustProxy: true,
});

app.register(config);


// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: 500 }, async function ({ signal, err, manual }) {
  if (err) { app.log.error(err) }
  if (signal) { app.log.info({ signal }, 'shutting down') }
  await app.close()
} as closeWithGrace.CloseWithGraceAsyncCallback);

app.addHook('onClose', (instance, done) => {
  closeListeners.uninstall()
  done()
});

app.listen({ port: 8080, host: '0.0.0.0' }, (err: any) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
});