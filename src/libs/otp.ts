import { PrismaClient } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";
import { createHash, randomInt } from "crypto";

const MAX_SENDS_PER_DAY = 5;
const ATTEMPTS_TO_ESCALATION = 5;
const EXPIRY_MILLISECONDS = 600 * 1000;
const COOLDOWN_MILLISECONDS = 90 * 1000;
const LOCKOUT_LADDER = [300, 3600, 86400];
const DAY_MILLISECONDS = 60 * 60 * 24 * 1000;

class OTP {
	private static generateOTP() {
    return randomInt(100000, 999999).toString();
  }
	
  private static generateHash(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  static async createAndSend(prisma: PrismaClient, email: string) {
  	const now = new Date();
   	const cooldown_cutoff = new Date(now.getTime() - COOLDOWN_MILLISECONDS);

    const otp = this.generateOTP();
    const hashed_otp = this.generateHash(otp);
    const expires_at = new Date(now.getTime() + EXPIRY_MILLISECONDS);

    const result = await prisma.$transaction(async (tx) => {
    	const record = await tx.otpAttempts.findFirst({ where: { email } });

    	if (!record) {
        await tx.otpAttempts.create({
          data: {
            email,
            hashed_otp,
            attempts: 0,
            expires_at,
            last_sent_at: now,
            locked_until: null,
            daily_send_count: 1,
            daily_reset_at: new Date(now.getTime() + DAY_MILLISECONDS),
          },
        });
        return { error: null };
     	}

      if (record.locked_until && record.locked_until > now) {
        const remaining_ms = record.locked_until.getTime() - now.getTime();
        return { error: 'rateLimit' as const, seconds: remaining_ms / 1000 };
      }

      if (record.last_sent_at > cooldown_cutoff) {
        const remaining_ms = COOLDOWN_MILLISECONDS - (now.getTime() - record.last_sent_at.getTime());
        return { error: 'rateLimit' as const, seconds: remaining_ms / 1000 };
      }

      const window_active = record.daily_reset_at && record.daily_reset_at > now;
      
      if (window_active && record.daily_send_count >= MAX_SENDS_PER_DAY) {
        const remaining_ms = record.daily_reset_at!.getTime() - now.getTime();
        return { error: 'rateLimit' as const, seconds: remaining_ms / 1000 };
      }
      
      const next_daily_count = window_active ? record.daily_send_count + 1 : 1;
      const next_daily_reset_at = window_active ? record.daily_reset_at : new Date(now.getTime() + DAY_MILLISECONDS);
      
      await tx.otpAttempts.update({
        where: { email },
        data: {
        	hashed_otp,
          expires_at,
          attempts: 0,
          last_sent_at: now,
          daily_send_count: next_daily_count,
          daily_reset_at: next_daily_reset_at,
        },
      });
      
      return { error: null };
    }, { isolationLevel: 'Serializable' });

    if (result.error === 'rateLimit') throw APIError.rateLimit(result.seconds);
    
    // send email OUTSIDE the transaction — don't hold a DB tx open during network I/O
    // await this.sendOtpEmail(email, otp);
  }
  
	static async verify(prisma: PrismaClient, otp: string, email: string) {
		const now = new Date();
		const result = await prisma.$transaction(async (tx) => {		
			const record = await tx.otpAttempts.findFirst({ where: { email } });
	
			if (!record)
				return { error: 'incorrectOTP' as const };

			if (record.locked_until && record.locked_until > now) {
				const remaining_ms = record.locked_until.getTime() - now.getTime();
				return { error: 'rateLimit' as const, seconds: remaining_ms / 1000 };
			}
	
			if (record.expires_at < now)
				return { error: 'incorrectOTP' as const };
	
			if (record.hashed_otp !== this.generateHash(otp)) {
				const attempts = record.attempts + 1;
				const has_crossed_threshold = attempts % ATTEMPTS_TO_ESCALATION === 0;
	
				if (!has_crossed_threshold) {
					await tx.otpAttempts.update({ where: { email }, data: { attempts } });
					return { error: 'incorrectOTP' as const };
				}
	
				const lockout_level = Math.ceil(attempts / ATTEMPTS_TO_ESCALATION);
				const lockout_seconds = (lockout_level <= LOCKOUT_LADDER.length)
					? LOCKOUT_LADDER[lockout_level - 1]!
					: 86400;
				const locked_until = new Date(now.getTime() + lockout_seconds * 1000);
	
				await tx.otpAttempts.update({ where: { email }, data: { attempts, locked_until, hashed_otp: this.generateOTP() } });
				return { error: 'rateLimit' as const, seconds: lockout_seconds };
			}
	
			// all is succesful, delete the record.
			await tx.otpAttempts.delete({ where: { email } });
			return { error: null };
		}, { isolationLevel: 'Serializable' });

		if (result.error === 'incorrectOTP') throw APIError.incorrectOTP();
  	if (result.error === 'rateLimit') throw APIError.rateLimit(result.seconds);
	}
}

export default OTP;