import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'
import type { Message } from '@/types/api'

export async function GET(request: NextRequest) {
  // Holen der Authentifizierungsinformationen aus den Cookies
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // Extrahiere die Suchparameter aus der Anfrage-URL z.B. chatid und fromid
    const searchParams = request.nextUrl.searchParams
    const chatid = searchParams.get('chatid')
    const fromid = searchParams.get('fromid') || '0'
    // Bereite die Parameter für den API-Aufruf vor z.B. { chatid: "123", fromid: "0" }
    const params: Record<string, string> = {
      fromid
    }
    // Füge chatid hinzu, falls vorhanden
    if (chatid) {
      params.chatid = chatid
    }
    // Rufe die getmessages API auf
    const messages = await callApi<Message[]>('getmessages', params, 'GET', token)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('[API /api/messages] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
