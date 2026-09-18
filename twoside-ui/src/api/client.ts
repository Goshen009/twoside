export class ApiError extends Error {
  status: number;
  fields?: { field: string; message: string }[];
  extensions?: Record<string, unknown>;

  constructor(problem: { status: number; message: string; [key: string]: unknown }) {
    super(problem.message);
    this.name = "ApiError";
    this.status = problem.status;
    this.fields = problem.fields as { field: string; message: string }[] | undefined;

    const rest = { ...problem } as Record<string, unknown>;
    delete rest.status;
    delete rest.message;
    delete rest.fields;
    this.extensions = rest;
  }
}

export class APIClient {
  private static readonly api_base_url = import.meta.env.VITE_API_BASE_URL;
  private static access_token: string | null = null;

  static onUnauthorized: (() => void) | null = null;

  static setAccessToken(token: string | null): void {
    this.access_token = token;
  }

  static extractAccessToken(response: Response): string {
    const header = response.headers.get("Authorization");
    if (!header) {
      throw new Error("No Authorization header returned by server");
    }
    return header.replace(/^Bearer\s+/i, "");
  }

  static async refresh(): Promise<boolean> {
    try {
      const res = await fetch(`${this.api_base_url}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        this.access_token = null;
        this.onUnauthorized?.();
        return false;
      }

      this.setAccessToken(this.extractAccessToken(res));
      return true;
    } catch {
      this.access_token = null;
      this.onUnauthorized?.();
      return false;
    }
  }

  static async request<T>(
    path: string,
    options: {
      method: "GET" | "POST" | "PATCH" | "DELETE";
      body?: unknown;
      use_auth?: boolean;
    }
  ): Promise<{ data: T; response: Response }> {
    const { method, body, use_auth = true } = options;

    for (let attempt = 0; attempt < 2; attempt++) {
      const headers: Record<string, string> = {};
      if (body) {
        headers["Content-Type"] = "application/json";
      }
      if (use_auth && this.access_token) {
        headers["Authorization"] = `Bearer ${this.access_token}`;
      }

      const res = await fetch(`${this.api_base_url}${path}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401 && use_auth && attempt === 0) {
        if (await this.refresh()) {
          continue;
        }
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

    throw new Error("APIClient.request exceeded retry limit");
  }
}
