import { PrismaClient } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";
import { createHash, randomInt } from "crypto";
import { Config } from "#/plugins/env.js";

import Email from "./email.js";

const MAX_ATTEMPTS_TO_LOCK = 5;
const MAX_OTP_REQUESTS_PER_DAY = 8;
const COOLDOWN_MILLISECONDS = 90 * 1000; // 90 seconds
const EXPIRY_MILLISECONDS = 60 * 10 * 1000; // 10 minutes
const DAY_MILLISECONDS = 60 * 60 * 24 * 1000; // 24 hours

class OTP {
	private static generateOTP() {
    return randomInt(100000, 999999).toString();
  }
	
  private static generateHash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private static formatDuration(ms: number): string {
    const total_seconds = Math.ceil(ms / 1000);
    const hours = Math.floor(total_seconds / 3600);
    const minutes = Math.floor((total_seconds % 3600) / 60);
    const seconds = total_seconds % 60;
  
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  
    if (parts.length === 1) return parts[0]!;
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
  }

  static async createAndSend(prisma: PrismaClient, config: Config, email: string, email_exists: boolean) {
  	const now = new Date();

    const otp = this.generateOTP();
    const hashed_otp = this.generateHash(otp);
    
    const expires_at = new Date(now.getTime() + EXPIRY_MILLISECONDS);
    const limit_reset_at = new Date(now.getTime() + DAY_MILLISECONDS);
    const cooldown_expires_at = new Date(now.getTime() + COOLDOWN_MILLISECONDS);

    const record = await prisma.otpAttempts.findFirst({ where: { email } });

    if (record) {
	    if (record.cooldown_expires_at > now) {
	    	const remaining_in_ms = record.cooldown_expires_at.getTime() - now.getTime();
	     	throw APIError.rateLimit(`Slow down — you can request another code in ${this.formatDuration(remaining_in_ms)}.`);
	    }
	
	    const has_limit_window_expired = record.limit_reset_at < now;
	    
	    if (!has_limit_window_expired && record.limit_send_count >= MAX_OTP_REQUESTS_PER_DAY) {
	     	const remaining_in_ms = record.limit_reset_at.getTime() - now.getTime();
	      throw APIError.rateLimit(`Eight OTP requests in one day? That's a lot. You're locked out for ${this.formatDuration(remaining_in_ms)} — if this was a genuine mistake, reach out and I'll sort it.`);
	    }
	
	    await prisma.otpAttempts.update({
	     	where: { email },
	      data: {
	      	hashed_otp, attempts: 0,
	       	expires_at, cooldown_expires_at,
	        limit_send_count: has_limit_window_expired ? 1 : { increment: 1 },
	        limit_reset_at: has_limit_window_expired ? limit_reset_at : record.limit_reset_at,
	      }
	    });
    }
    else {
    	await prisma.otpAttempts.create({
     		data: {
       		email, hashed_otp, attempts: 0,
         	expires_at, cooldown_expires_at,
          limit_send_count: 1,
          limit_reset_at,
       	}
     	});
    }

    if (config.ENVIRONMENT === 'local') {
    	console.log(otp);
    } else {
	    try {
	      await Email.sendOTP(config, { address: email, code: otp, email_exists });
	    } catch (err) {
	      console.log(`Failed to send email for ${email}. Error is ${err}`);
	      await prisma.otpAttempts.delete({ where: { email } }).catch(() => {});
	      throw APIError.internalServerError();
	    }
    }
  }
  
	static async verify(prisma: PrismaClient, otp: string, email: string) {
		const now = new Date();
		const record = await prisma.otpAttempts.findFirst({ where: { email } });

		if (!record)
			throw APIError.incorrectOTP();

		if (record.expires_at < now)
			throw APIError.incorrectOTP();

		if (record.attempts >= MAX_ATTEMPTS_TO_LOCK)
			throw APIError.incorrectOTP();

		if (record.hashed_otp !== this.generateHash(otp)) {
			await prisma.otpAttempts.update({ where: { email }, data: { attempts: { increment: 1 } } });
			throw APIError.incorrectOTP();
		}

		// all is well, delete the record
		await prisma.otpAttempts.delete({ where: { email } });
	}
}

export default OTP;