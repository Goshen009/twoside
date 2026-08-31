// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = "http://100.103.127.67:8080";
const API_BASE_URL = "http://100.99.208.67:8080";

export class ApiError extends Error {
  status: number;
  fields?: { field: string; message: string }[];
  extensions?: Record<string, unknown>;

  constructor(problem: { status: number; message: string; [key: string]: unknown }) {
    super(problem.message);
    this.status = problem.status;
    this.fields = problem.fields as { field: string; message: string }[] | undefined;

    const rest = { ...problem } as Record<string, unknown>;
    delete rest.status;
    delete rest.message;
    delete rest.fields;
    this.extensions = rest;
  }
}

class APIClient {
	private static access_token: string | null = null;

	static onUnauthorized: (() => void) | null = null;

	static setAccessToken(token: string | null) {
		this.access_token = token;
	}
	
	static async request<T>(
		path: string,
		options: {
			method: "GET" | "POST" | "PATCH" | "DELETE",
			body?: unknown,
			use_auth?: boolean
		}
	): Promise<{ data: T, response: Response }> {
		const { method, body, use_auth = true } = options;

		const headers: Record<string, string> = { };
		if (body)
			headers['Content-Type'] = 'application/json';
		
		if (use_auth)
			headers['Authorization'] = `Bearer ${this.access_token}`;

		const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

		if (res.status === 401)
			this.access_token = null;

		if (!res.ok) {
      const problem = await res.json().catch(() => ({
        status: res.status,
        message: "An unexpected error occurred",
      }));
      throw new ApiError(problem);
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : (undefined as T);
    
    return { data, response: res };
	}
}

export default APIClient;