import { NextResponse } from 'next/server'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const userid = String(form.get('userid') || '')
    const password = String(form.get('password') || '')

    console.log('[Login] Attempt for:', userid)

    if (!userid || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

      const data = await callApi<{ token: string }>(
        'login',
        { userid, password }
        // 'GET' ist der Default in serverApi.ts
      )

    console.log('[Login] Success, token received')

    const res = NextResponse.json({ ok: true })
    res.cookies.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
    })
    return res
  } catch (err) {
    console.error('[Login] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    )
  }
}
