import { OAuth2Client } from "google-auth-library";
import { APIError } from "#/errors/APIError.js";
import { Config } from "#/plugins/env.js";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
}

class Google {
	static getAuthUrl(config: Config, state: string): string {
    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: config.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      state,
    });
	
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private static async verifyIdToken(config: Config, id_token: string): Promise<GoogleProfile> {
    const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: config.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    
    if (!payload?.email || !payload.sub)
      throw APIError.custom({ status: 400, message: "Failed to authenticate with Google." });
  
    if (!payload.email_verified)
      throw APIError.custom({ status: 400, message: "Your Google account's email is not verified with Google. Please verify it with Google, or sign up using a different method." });
      
    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: !!payload.email_verified,
      name: payload.name ?? "",
    };
  }

  static async exchangeCode(config: Config, code: string): Promise<GoogleProfile> {  
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
  
    if (!response.ok)
      throw APIError.custom({ status: 400, message: "Failed to authenticate with Google." });
  
    const data = await response.json() as GoogleTokenResponse;
    return this.verifyIdToken(config, data.id_token);
  }
}

export default Google;