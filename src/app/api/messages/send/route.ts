import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'

export async function POST(request: NextRequest) {
  // Holen der Authentifizierungsinformationen aus den Cookies
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    // konvertiere json in den body
    const body = await request.json()
    const { text, chatid, photo, position } = body

    console.log('[API /api/messages/send] Request body:', { text, chatid, photo, position })
    // Bereite die Parameter für den API-Aufruf vor
    const params: Record<string, string> = {}
    // Füge nur die Parameter hinzu, die vorhanden sind
    if (text) params.text = text
    if (chatid) params.chatid = chatid
    if (photo) params.photo = photo
    if (position) params.position = position
    // Rufe die postmessage API auf
    const result = await callApi<{ messageid: string }>('postmessage', params, 'POST', token)
    console.log('[API /api/messages/send] Result:', result)
    // Sende die Antwort zurück an den frontend
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API /api/messages/send] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
