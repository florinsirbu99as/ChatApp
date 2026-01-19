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

    const response = await fetch(photoUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend hat ${response.status} zurückgegeben` },
        { status: response.status }
      )
    }

    // Hole Bild-Blob vom Backend
    const imageBlob = await response.blob()

    // Konvertiere Blob zu Base64 für JSON-Antwort
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({ photo: dataUrl })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Fehler beim Abrufen des Fotos'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
