import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
  }

  try {
    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}
