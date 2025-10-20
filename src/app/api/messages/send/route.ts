import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { text, chatid, photo, position } = body

    console.log('[API /api/messages/send] Request body:', { text, chatid, photo, position })

    const params: Record<string, string> = {}
    
    if (text) params.text = text
    if (chatid) params.chatid = chatid
    if (photo) params.photo = photo
    if (position) params.position = position

    // Try different possible command names
    // First try 'sendmessage' instead of 'postmessage'
    const result = await callApi<{ messageid: string }>('postmessage', params, 'POST', token)
    
    console.log('[API /api/messages/send] Result:', result)

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
