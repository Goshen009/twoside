import { Config } from "#/plugins/env.js";

interface EmailPayload {
  to: { email_address: { address: string } }[];
  subject: string;
  htmlbody: string;
  textbody: string;
}

const header = `
  <div style="background:#3B6D11;padding:1.5rem 2rem;text-align:center;">
    <p style="margin:0;font-size:20px;font-weight:500;color:#EAF3DE;">SideQuest</p>
  </div>`;

const footer = `
  <div style="background:#f9f9f9;padding:1rem 2.5rem;border-top:1px solid #eee;text-align:center;">
    <p style="font-size:12px;color:#aaa;margin:0;">© 2026 SideQuest</p>
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
        from: { address: "noreply@sidequest.ng", name: "SideQuest" },
        ...payload,
      }),
    });
  }

  static async sendOTP(config: Config, params: { address: string, code: string }) {
    const digits = params.code.split("");
  
    const codeBlocks = digits
      .map(
        (d) => `
        <td style="padding:0 4px;">
          <div style="width:40px;height:48px;background:#F3F7EE;border:1px solid #D8E8C4;border-radius:8px;text-align:center;line-height:48px;font-size:22px;font-weight:600;color:#2A4D0D;">
            ${d}
          </div>
        </td>`
      )
      .join("");
  
    const htmlContent = `
      <p style="margin:0 0 0.5rem;font-size:16px;color:#222;">Hey there,</p>
      <p style="margin:0 0 1.5rem;font-size:15px;color:#555;line-height:1.5;">
        Use the code below to verify it's you. This code expires in <strong>10 minutes</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 1.5rem;">
        <tr>${codeBlocks}</tr>
      </table>
      <p style="margin:0;font-size:13px;color:#999;line-height:1.5;">
        Didn't request this? You can safely ignore this email — no changes were made to your account.
      </p>`;
  
   	const payload: EmailPayload = {
     	to: [{ email_address: { address: params.address } }],
     	subject: `${params.code} is your SideQuest verification code`,
      htmlbody: wrap(htmlContent),
      textbody: `Your SideQuest verification code is ${params.code}. This code expires in 10 minutes. Didn't request this? You can safely ignore this email.`
    };
   	await this.sendEmail(config, payload);
  }
}

export default Email;