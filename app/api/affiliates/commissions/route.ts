import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/affiliates/commissions?affiliateId=xxx&period=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const period = searchParams.get('period'); // "30" for last 30 days

    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliateId é obrigatório' }, { status: 400 });
    }

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (period) {
      const days = parseInt(period, 10);
      if (!isNaN(days)) {
        dateFilter.gte = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      }
    }

    const affiliate = await db.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    const commissions = await db.commission.findMany({
      where: {
        affiliateId,
        ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt as Record<string, Date> } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            total: true,
            status: true,
            createdAt: true,
            affiliateRef: true,
          },
        },
      },
    });

    // Filter: only return commissions where affiliate's referralCode matches order's affiliateRef
    const filteredCommissions = commissions.filter(
      (c) => c.order.affiliateRef === affiliate.referralCode
    );

    const formatted = filteredCommissions.map((c) => ({
      id: c.id,
      orderId: c.order.id,
      customerName: c.order.customerName,
      orderTotal: c.order.total,
      rate: c.rate,
      amount: c.amount,
      status: c.status,
      orderStatus: c.order.status,
      createdAt: c.createdAt.toISOString(),
    }));

    // Summary stats
    const totalAmount = formatted.reduce((sum, c) => sum + c.amount, 0);
    const pendingAmount = formatted
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
    const paidAmount = formatted
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      commissions: formatted,
      summary: {
        total: formatted.length,
        totalAmount,
        pendingAmount,
        paidAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comissões' },
      { status: 500 }
    );
  }
}
