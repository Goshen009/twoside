const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  fields?: { field: string; message: string }[];
  extensions?: Record<string, unknown>;

  constructor(problem: { status: number; message: string; [key: string]: unknown }) {
    super(problem.message);
    this.status = problem.status;
    this.fields = problem.fields as { field: string; message: string }[] | undefined;

    const { status, message, fields, ...rest } = problem;
    this.extensions = rest;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => ({
      status: res.status,
      message: "An unexpected error occurred",
    }));
    throw new ApiError(problem);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}