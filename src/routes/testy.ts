import Webpush from "#/libs/webpush.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	await Webpush.sendPushNotifications(this.prisma, this.config, {
		// "646a3223-12af-4847-8e1d-b068c08b6e69": { title: "Your notification", body: "Hi Canon!" },
		"007f4b31-523d-4c6c-b712-abf59754c40d": { title: "Your notification Goshen", body: "Hi Goshen!" },
		"393a228c-3d6c-4ddc-b588-bf329fa5ca00": { title: "Your notification Femi", body: "Hi Femi!" }
	});
  
  return reply.code(200).send({});
}

export const testy = { handler };