import fp from 'fastify-plugin';
import cron from 'node-cron';

import Telegram from '#/libs/telegram.js';
import DailyStats from '#/cron/daily-stats.js';
import DailyReminder from '#/cron/daily-reminder.js';

export default fp(async (fastify) => {
  cron.schedule('0 5 * * *', async () => {
  	if (fastify.config.ENVIRONMENT === 'beta') {
	 		try {
	      const text = await DailyStats.run(fastify.prisma);
	      const res = await Telegram.sendMessage(fastify.config, text);
			
	      if (!res.ok)
		      fastify.log.error({ status: res.status, body: await res.text() }, 'telegram send failed');
	    } catch (err) {
		    fastify.log.error(err, 'daily stats failed');
	    }
   	}
  }, { timezone: 'Africa/Lagos' });

  cron.schedule('*/15 * * * *', async () => {
  	if (fastify.config.ENVIRONMENT === 'beta' || fastify.config.ENVIRONMENT === 'preview') {
			try {
				await DailyReminder.run(fastify.prisma, fastify.config);
			} catch (err) {
				fastify.log.error(err, 'daily reminder failed');
			}
   }
  });
}, {
  name: 'cron',
  dependencies: ['db']
});