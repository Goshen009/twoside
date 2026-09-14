import { Config } from "#/plugins/env.js";

interface EmailPayload {
  to: { email_address: { address: string } }[];
  subject: string;
  htmlbody: string;
  textbody: string;
}

const header = `
  <div style="background:#3B6D11;padding:1.5rem 2rem;text-align:center;">
    <p style="margin:0;font-size:20px;font-weight:500;color:#EAF3DE;">Twoside</p>
  </div>`;

const footer = `
  <div style="background:#f9f9f9;padding:1rem 2.5rem;border-top:1px solid #eee;text-align:center;">
    <p style="font-size:12px;color:#aaa;margin:0;">© 2026 Twoside</p>
  </div>`;

const wrap = (content: string): string => {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:2rem 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
        <tr><td>${header}</td></tr>
        <tr><td style="padding:2rem 2.5rem;">${content}</td></tr>
        <tr><td>${footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

class Email {
	private static async sendEmail(config: Config, payload: EmailPayload) {
    return await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${config.ZEPTO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { address: "noreply@app.twoside.dev", name: "Twoside" },
        ...payload,
      }),
    });
  }

  static async sendOTP(config: Config, params: { address: string, code: string, email_exists: boolean }) {
    const greeting = params.email_exists
      ? `<p style="margin:0 0 0.5rem;font-size:16px;color:#222;">Welcome back,</p>
          <p style="margin:0 0 1.5rem;font-size:15px;color:#555;line-height:1.5;">
           Use the code below to log in to Twoside. This code expires in <strong>10 minutes</strong>.
         </p>`
      : `<p style="margin:0 0 0.5rem;font-size:16px;color:#222;">Hey there,</p>
       	<p style="margin:0 0 1.5rem;font-size:15px;color:#555;line-height:1.5;">
           Use the code below to finish setting up your Twoside account. This code expires in <strong>10 minutes</strong>.
         </p>`;
  
    const htmlContent = `
      ${greeting}
      <div style="margin:0 auto 1.5rem;text-align:center;">
        <span style="display:inline-block;padding:14px 28px;background:#F3F7EE;border:1px solid #D8E8C4;border-radius:8px;font-size:28px;font-weight:600;letter-spacing:6px;color:#2A4D0D;">
          ${params.code}
        </span>
      </div>
      <p style="margin:0;font-size:13px;color:#999;line-height:1.5;">
        Didn't request this? You can safely ignore this email — no changes were made to your account.
      </p>`;
  
    const subject = params.email_exists
      ? `${params.code} is your Twoside login code`
      : `Welcome to Twoside. ${params.code} is your verification code`;
  
    const textbody = params.email_exists
    	? `Your Twoside login code is ${params.code}. This code expires in 10 minutes. Didn't request this? You can safely ignore this email.`
      : `Your Twoside verification code is ${params.code}. Use it to finish setting up your account. This code expires in 10 minutes. Didn't request this? You can safely ignore this email.`;
  
    const payload: EmailPayload = {
   		to: [{ email_address: { address: params.address } }],
     	subject,
      htmlbody: wrap(htmlContent),
      textbody
   	};
    await this.sendEmail(config, payload);
  }
}

export default Email;