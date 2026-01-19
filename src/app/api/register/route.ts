
import { NextResponse } from 'next/server'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const userid = String(form.get('userid') || '')
    const password = String(form.get('password') || '')
    const firstname = String(form.get('firstname') || '')
    const lastname = String(form.get('lastname') || '')

    if (!userid || !password || !firstname || !lastname) {
      return NextResponse.json({ error: 'Username, password, firstname and lastname required' }, { status: 400 })
    }

    // Die API erwartet nickname und fullname
    const nickname = firstname
    const fullname = `${firstname} ${lastname}`

    // Call external API (default method is GET)
    const data = await callApi<{ token: string }>(
      'register',
      { userid, password, nickname, fullname }
    )

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
