import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'


//um zu sehen ob man eingeloggt ist oder nicht
export async function GET() {
  const token = (await cookies()).get('token')?.value
  return NextResponse.json({ authenticated: Boolean(token) })
}
