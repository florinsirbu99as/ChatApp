// src/lib/serverApi.ts

export async function callApi<T>(
  request: string,
  params: Record<string, string | number | undefined> = {},
  method: 'GET' | 'POST' = 'POST',
  token?: string
): Promise<T> {
  const base = process.env.API_BASE_URL!;
  const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded' };

  const body = new URLSearchParams();
  body.set('request', request);
  for (const [k, v] of Object.entries(params)) if (v != null) body.set(k, String(v));
  if (token) body.set('token', token);

  const res = await fetch(base, { method, headers, body, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${request} fehlgeschlagen: ${res.status}`);
  return res.json() as Promise<T>;
}
