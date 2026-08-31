const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  skip_auth?: boolean;
};

class ApiClient {
	// intentionally stored in memory.
  private static access_token: string | null = null;

  // Set by AuthProvider. Called whenever a request comes back 401,
  // so React state finds out the token died even outside a login/refresh call.
  static on_unauthorized: (() => void) | null = null;

  static getAccessToken(): string | null {
    return this.access_token;
  }

  static setAccessToken(token: string) {
    this.access_token = token;
  }

  static clearAccessToken() {
    this.access_token = null;
  }

  static async request<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; response: Response }> {
    const { method = "GET", body, skip_auth = false } = options;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!skip_auth && this.access_token) {
      headers.Authorization = `Bearer ${this.access_token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && !skip_auth) {
      this.clearAccessToken();
      this.on_unauthorized?.();
    }

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

export default ApiClient;