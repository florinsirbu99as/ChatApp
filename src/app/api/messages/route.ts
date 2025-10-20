import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'
import type { Message } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const chatid = searchParams.get('chatid')
    const fromid = searchParams.get('fromid') || '0'

    const params: Record<string, string> = {
      fromid
    }

    if (chatid) {
      params.chatid = chatid
    }

    // Call the getmessages API
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
