import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import OTP from "#/libs/otp.js";

const schema = z.object({
	email: z.email().trim()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { email } = request.body;

  const does_user_exist = !!(await this.prisma.user.findFirst({ where: { email } }));

  await OTP.createAndSend(this.prisma, this.config, email, does_user_exist);

  return reply.code(200).send({ message: "If this email exists, an OTP has been sent." });
}

export const request_otp = { handler, schema: { body: schema } };