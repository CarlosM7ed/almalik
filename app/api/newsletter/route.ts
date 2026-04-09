import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const subscriber = await db.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
  }
}
