import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Hole Token aus Cookies für Authentifizierung
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Hole photoid aus Query-Parametern
    const searchParams = request.nextUrl.searchParams
    const photoid = searchParams.get('photoid')

    if (!photoid) {
      return NextResponse.json({ error: 'photoid erforderlich' }, { status: 400 })
    }

    console.log(`[API /api/photo] Hole Foto mit ID: ${photoid}`)

    const apiBaseUrl = process.env.API_BASE_URL
    if (!apiBaseUrl) {
      throw new Error('API_BASE_URL nicht konfiguriert')
    }

    // Rufe Backend getphoto API auf
    // Die Antwort ist ein Blob (echte Bilddaten), nicht JSON
    const params = new URLSearchParams({
      request: 'getphoto',
      token: token,
      photoid: photoid,
    })

    const photoUrl = `${apiBaseUrl}?${params.toString()}`
    console.log(`[API /api/photo] Rufe Backend auf: ${photoUrl}`)

    const response = await fetch(photoUrl)

    if (!response.ok) {
      console.error(`[API /api/photo] Backend hat ${response.status} zurückgegeben`)
      return NextResponse.json(
        { error: `Backend hat ${response.status} zurückgegeben` },
        { status: response.status }
      )
    }

    // Hole Bild-Blob vom Backend
    const imageBlob = await response.blob()
    console.log(`[API /api/photo] Bild-Blob empfangen, Größe: ${imageBlob.size} bytes`)

    // Konvertiere Blob zu Base64 für JSON-Antwort
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({ photo: dataUrl })
  } catch (error) {
    console.error('[API /api/photo] Fehler:', error)
    const errorMessage = error instanceof Error ? error.message : 'Fehler beim Abrufen des Fotos'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
