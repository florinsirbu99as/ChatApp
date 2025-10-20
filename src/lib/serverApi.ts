// src/lib/serverApi.ts
export async function callApi<T>(
  request: string, // login, register, postmessage, etc.
  params: Record<string, string | number | undefined> = {},
  method: 'GET' | 'POST' = 'GET',
  token?: string
): Promise<T> {
  const base = process.env.API_BASE_URL!; // Should be: https://www2.hs-esslingen.de/~nitzsche/api
  
  const urlParams = new URLSearchParams();
  
  // Add all params
  for (const [k, v] of Object.entries(params)) {
    if (v != null) urlParams.set(k, String(v));
  }
  
  if (token) urlParams.set('token', token);
  
  let url: string;
  let fetchOptions: RequestInit;
  
  if (method === 'GET') {
    // For GET: command as query param
    urlParams.set('request', request);
    url = `${base}?${urlParams.toString()}`;
    fetchOptions = {
      method: 'GET',
      cache: 'no-store',
    };
  } else {
    // For POST: send request command in the body along with other params
    urlParams.set('request', request);
    url = base; // Don't append anything to base URL
    
    console.log(`[API] POST to: ${url}`);
    console.log(`[API] POST body params:`, urlParams.toString());
    
    fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlParams.toString(),
      cache: 'no-store',
    };
  }
  
  console.log(`[API] ${method} ${request}`, params);
  console.log(`[API] Full URL:`, url);
  
  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    
    console.log(`[API] Response status: ${res.status}`);
    console.log(`[API] Response text:`, text.substring(0, 500));
    
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