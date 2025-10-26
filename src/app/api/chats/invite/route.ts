import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value     
    
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { invitedhash, chatid } = await req.json();
    if (!invitedhash) return NextResponse.json({ error: 'invitedhash required' }, { status: 400 });
    if (chatid==null) return NextResponse.json({ error: 'chatid required' }, { status: 400 }); 

    const result = await callApi (
      'invite',
      { chatid: Number(chatid), invitedhash },
      'GET',
      token
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to invite user' }, { status: 500 });
  }
}
