import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = searchParams.get('limit');
  const affiliateRef = searchParams.get('affiliateRef');
  const trafficType = searchParams.get('trafficType');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (affiliateRef) where.affiliateRef = affiliateRef;
  if (trafficType === 'direct') where.affiliateRef = '';

  const orders = await db.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(limit) : undefined,
  });

  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const affiliateRef = body.affiliateRef || '';

  const order = await db.order.create({
    data: {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      country: body.country || 'PT',
      paymentMethod: body.paymentMethod || 'Pagamento na Entrega',
      total: body.total,
      affiliateRef,
      items: {
        create: body.items.map((item: { productId: string; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // Update stock
  for (const item of body.items) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // Create commission if affiliate ref exists
  if (affiliateRef) {
    const affiliate = await db.affiliate.findUnique({
      where: { referralCode: affiliateRef },
    });

    if (affiliate && affiliate.isActive) {
      const commissionAmount = body.total * affiliate.commissionRate;

      await db.commission.create({
        data: {
          affiliateId: affiliate.id,
          orderId: order.id,
          orderTotal: body.total,
          rate: affiliate.commissionRate,
          amount: commissionAmount,
          status: 'pending',
        },
      });

      await db.affiliate.update({
        where: { id: affiliate.id },
        data: {
          balance: { increment: commissionAmount },
          totalEarned: { increment: commissionAmount },
        },
      });
    }
  }

  return NextResponse.json({ order }, { status: 201 });
}
