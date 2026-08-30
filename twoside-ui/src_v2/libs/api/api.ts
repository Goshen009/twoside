import APIClient from "./cilent";

class API {
	static async refrshSession(): Promise<boolean> {
		try { 
			const { response } = await APIClient.request("/auth/refresh", { method: 'POST', use_auth: false });
			APIClient.setAccessToken(extractAccessToken(response));
			return true;
		} catch {
			 return false;
		}
	}

	static async logout() {
		try {
			await APIClient.request("/auth/logout", { method: 'POST' })
		} finally {
			APIClient.setAccessToken(null);
		}
	}
}

const extractAccessToken = (response: Response): string => {
	const header = response.headers.get("Authorization");
  if (!header)
		throw new Error("No Authorization header returned by server");
	return header.replace(/^Bearer\s+/i, "");
}

export default API;