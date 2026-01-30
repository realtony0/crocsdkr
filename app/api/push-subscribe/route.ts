import { NextRequest, NextResponse } from 'next/server';
import { addSubscription } from '@/lib/send-push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    addSubscription({ endpoint, keys });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
