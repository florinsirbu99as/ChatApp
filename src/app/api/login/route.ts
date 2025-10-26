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

    const data = await callApi<{ token: string, hash?: string }>(
      'login',
      { userid, password }      
      // 'GET' ist der Default in serverApi.ts
    )
    console.log('[Login] Success, token received')
    console.log('[Login] token:', data.token)
    console.log('[Login] hash:', (data as any).hash)


    const res = NextResponse.json({ ok: true })
    res.cookies.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
    })
    if (data.hash) {
      //die hashs für die invites in die Chats. Nur zum Anzeigen im Frontend 
      res.cookies.set('userhash', data.hash, {
        httpOnly: false, 
        sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
      })
    }
        
    return res
  } catch (err) {
    console.error('[Login] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    )
  }
}
