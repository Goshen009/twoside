import ApiClient from "./client";

type AuthResponse = { message: string };

class AuthApi {
	private static extractAccessToken(response: Response): string {
	  const header = response.headers.get("Authorization");
	  if (!header) throw new Error("No Authorization header returned by server");
	  return header.replace(/^Bearer\s+/i, "");
	}
	
  static async login(username: string, pin: string): Promise<void> {
    const { response } = await ApiClient.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { username, pin },
      skip_auth: true,
    });
    ApiClient.setAccessToken(this.extractAccessToken(response));
  }

  static async register(username: string, pin: string, confirm_pin: string): Promise<void> {
    const { response } = await ApiClient.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: { username, pin, confirm_pin },
      skip_auth: true,
    });
    ApiClient.setAccessToken(this.extractAccessToken(response));
  }

  static async refreshSession(): Promise<boolean> {
    try {
      const { response } = await ApiClient.request<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: { },
        skip_auth: true,
      });
      ApiClient.setAccessToken(this.extractAccessToken(response));
      return true;
    } catch {
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.request<AuthResponse>("/auth/logout", { method: "POST", body: { }});
    } finally {
	   	// Clear client-side state regardless of whether the network call succeeds —
	    // no reason to leave the user "logged in" locally if the request fails.
      ApiClient.clearAccessToken();
    }
  }
}

export default AuthApi;