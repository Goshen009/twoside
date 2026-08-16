const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.1.200:8080';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // const token = getToken();
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE3Y2NiMmY5LWUyMjAtNDRiYi04MzhjLWI2YWY4MTIxNzllZCIsImlhdCI6MTc4NjkxMTk0MCwiZXhwIjoxNzg3MDg0NzQwfQ.os4AKn2pujg4L-U0tiq7-qQw0u3kdT3il1VvMVN-sQk';
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}