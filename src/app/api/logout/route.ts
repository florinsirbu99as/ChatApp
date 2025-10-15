import { NextResponse } from 'next/server'
import { callApi } from '@/lib/serverApi'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    // Inform the server about logout if we have a token
    if (token) {
      await callApi('logout', {}, undefined, token)
    }
  } catch (err) {
    console.error('Logout API call failed:', err)
    // Continue to clear cookie even if API call fails
  }

  // Always clear the cookie
  const res = NextResponse.json({ ok: true })
  res.cookies.set('token', '', {
    httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
