import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { callApi } from '@/lib/serverApi'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value     
    
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { chatid } = await req.json();
    if (!chatid) return NextResponse.json({ error: 'chatid required' }, { status: 400 });

    const result = await callApi<{ chatid?: string | number }>(
      'deletechat',
      { chatid },
      'GET',
      token
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to delete chat' }, { status: 500 });
  }
}
