// src/lib/serverApi.ts

export async function callApi<T>(
  request: string,
  params: Record<string, string | number | undefined> = {},
  method: 'GET' | 'POST' = 'GET',  // Changed default to GET
  token?: string  // optional
): Promise<T> {
  const base = process.env.API_BASE_URL!;
  
  const urlParams = new URLSearchParams();
  urlParams.set('request', request);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) urlParams.set(k, String(v));
  }
  if (token) urlParams.set('token', token);

  let url: string;
  let fetchOptions: RequestInit;

  if (method === 'GET') {
    // For GET requests, append params to URL
    url = `${base}?${urlParams.toString()}`;
    fetchOptions = {
      method: 'GET',
      cache: 'no-store',
    };
  } else {
    // For POST requests, send params in body
    url = base;
    fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlParams,
      cache: 'no-store',
    };
  }

  console.log(`[API] ${method} ${request}`, params);

  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    
    console.log(`[API] Response status: ${res.status}`);
    console.log(`[API] Response text:`, text.substring(0, 200));

    if (!res.ok) {
      throw new Error(`API ${request} failed: ${res.status} - ${text}`);
    }

    // Try to parse JSON
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      throw new Error(`API ${request} returned invalid JSON: ${text.substring(0, 100)}`);
    }
  } catch (err) {
    console.error(`[API] ${request} error:`, err);
    throw err;
  }
}
