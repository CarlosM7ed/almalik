import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, productId, productName } = body;

  if (!email || !productId) {
    return NextResponse.json({ error: 'Email and productId are required' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  try {
    const productExists = await db.product.findUnique({ where: { id: productId } });
    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const notification = await db.stockNotification.create({
      data: { email, productId, productName: productName || productExists.name },
    });

    return NextResponse.json(
      { message: 'Notification registered successfully', notification },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to register notification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId query parameter is required' }, { status: 400 });
  }

  try {
    const count = await db.stockNotification.count({
      where: { productId },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
