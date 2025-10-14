import { NextResponse } from 'next/server'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  const form = await req.formData()
  const userid = String(form.get('userid') || '')
  const password = String(form.get('password') || '')

  if (!userid || !password)
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const data = await callApi<{ token: string }>(
    'login', { userid, password }, 'POST')

  const res = NextResponse.json({ ok: true })
  res.cookies.set('token', data.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, //7 days 
  })
  return res
}
