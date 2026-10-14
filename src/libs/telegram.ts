import { Config } from "#/plugins/env.js";

class Telegram {
	private static url(bot_token: string) { return `https://api.telegram.org/bot${bot_token}/sendMessage`; }
	
	static async sendMessage(config: Config, text: string) {
		return await fetch(this.url(config.TELEGRAM_BOT_TOKEN), {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ chat_id: config.TELEGRAM_CHAT_ID, text })
		});
		
	}
}

export default Telegram;