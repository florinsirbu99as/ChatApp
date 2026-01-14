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

    // Body lesen und Felder extrahieren
    const payload = await request.json()
    const { text, chatid, photo, position, fileUrl, fileName, fileSize, fileType } = payload

    if (chatid == null) {
      return NextResponse.json({ error: 'chatid required' }, { status: 400 })
    }

    let finalMessageText = text ?? '';
    if (fileUrl) {
      // Wenn ein File dabei ist, kodieren wir die Metadaten in den Text
      finalMessageText = `[FILE_V1]${JSON.stringify({
        url: fileUrl,
        name: fileName,
        size: fileSize,
        type: fileType,
        caption: text ?? ''
      })}`;
    }

    const params: Record<string, any> = {
      chatid: Number(chatid),          // Zahl
      text: finalMessageText,          // String (kodiert wenn Datei)
      photo: photo ?? '',              // String (auch leer)
      position: position ?? '',        // String (auch leer)
      _t: Date.now(),                  // Timestamp als Zahl
    }

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
