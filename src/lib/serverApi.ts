// src/lib/serverApi.ts
export async function callApi<T>(
  request: string, // z.B. "login", "getmessages", "postmessage" - welche API-Funktion soll aufgerufen werden?
  params: Record<string, string | number | undefined> = {}, // z.B. { chatid: "123", text: "Hallo" } - die Daten für die API
  method: 'GET' | 'POST' = 'GET', // Wie sollen die Daten gesendet werden? GET oder POST?
  token?: string // Der Authentifizierungs-Token (um zu beweisen, dass der Benutzer angemeldet ist)
): Promise<T> {
  const base = process.env.API_BASE_URL!; // Die Backend-Server-Adresse
  
  const urlParams = new URLSearchParams();
  
  // Schleife: Gehe durch alle Parameter und füge sie zur URL hinzu
  for (const [k, v] of Object.entries(params)) {
    if (v != null) urlParams.set(k, String(v));
  }
  
  // Füge den Token hinzu (damit der Server weiß, wer wir sind)
  if (token) urlParams.set('token', token);
  
  let url: string;
  let fetchOptions: RequestInit;
  
  if (method === 'GET') {
    // Bei GET: Der Request-Name wird in die URL als Parameter eingefügt
    // Beispiel: https://api.com?request=login&token=xyz123
    urlParams.set('request', request);
    url = `${base}?${urlParams.toString()}`;
    fetchOptions = {
      method: 'GET',
      cache: 'no-store',
    };
  } else {
    // Bei POST: Der Request-Name und alle Parameter gehen in den Body der Anfrage
    // Beispiel: Body enthält "request=login&username=max&password=123"
    urlParams.set('request', request);
    url = base; // Die URL bleibt einfach - alle Daten gehen in den Body
    
    console.log(`[API] POST zu: ${url}`);
    console.log(`[API] Daten werden gesendet:`, urlParams.toString());
    
    fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlParams.toString(), // Alle Daten gehen hier rein
      cache: 'no-store',
    };
  }
  
  console.log(`[API] ${method} Request: ${request}`, params);
  console.log(`[API] URL:`, url);
  
  try {
    // Sende den Request an den Backend-Server
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    
    console.log(`[API] Status zurück: ${res.status}`);
    console.log(`[API] Antwort (erste 500 Zeichen):`, text.substring(0, 500));
    
    // War die Anfrage erfolgreich? (Status 200-299?)
    if (!res.ok) {
      throw new Error(`API "${request}" Fehler: ${res.status} - ${text}`);
    }
    
    // Versuche die Antwort als JSON zu interpretieren
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      // Die Antwort ist keine gültige JSON - das ist ein Problem
      console.error('[API] Die Antwort ist kein gültiges JSON:', parseError);
      throw new Error(`API "${request}" gab keine gültigen Daten zurück: ${text.substring(0, 100)}`);
    }
  } catch (err) {
    // Fehlerbehandlung - etwas ist schief gelaufen
    console.error(`[API] Fehler bei "${request}":`, err);
    throw err; // Werfe den Fehler weiter
  }
}