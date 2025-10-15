import { NextResponse } from 'next/server'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const userid = String(form.get('userid') || '')
    const password = String(form.get('password') || '')
    const nickname = String(form.get('nickname') || '')
    const fullname = String(form.get('fullname') || '')

    console.log('[Register] Received:', { userid, nickname, fullname })

    if (!userid || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

      // Call external API (default method is GET)
      const data = await callApi<{ token: string }>(
        'register',
        { userid, password, nickname, fullname }
        // 'GET' ist der Default in serverApi.ts
      )

    console.log('[Register] Success, token received')

    const res = NextResponse.json({ ok: true })
    res.cookies.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err) {
    console.error('[Register] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
