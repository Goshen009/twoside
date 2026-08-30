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