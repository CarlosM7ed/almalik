import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/affiliates/me?id=xxx — Get affiliate data, stats, commissions and withdrawals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const affiliate = await db.affiliate.findUnique({
      where: { id },
      include: {
        commissions: {
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
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    const { password: _, commissions, withdrawals, ...affiliateData } = affiliate;

    // Filter commissions: only where affiliate's referralCode matches order's affiliateRef
    const validCommissions = commissions.filter(
      (c) => c.order.affiliateRef === affiliate.referralCode
    );

    const formattedCommissions = validCommissions.map((c) => ({
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

    const formattedWithdrawals = withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      status: w.status,
      iban: w.iban,
      accountHolder: w.accountHolder,
      notes: w.notes,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.updatedAt.toISOString(),
    }));

    // Calculate stats
    const pendingCommissions = validCommissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);

    const paidCommissions = validCommissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalSales = validCommissions.reduce((sum, c) => sum + c.orderTotal, 0);
    const totalOrders = validCommissions.length;
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      affiliate: affiliateData,
      stats: {
        totalEarned: affiliate.totalEarned,
        balance: affiliate.balance,
        totalWithdrawn: affiliate.totalWithdrawn,
        totalSales,
        totalOrders,
        pendingCommissions,
        paidCommissions,
        pendingWithdrawals,
      },
      commissions: formattedCommissions,
      withdrawals: formattedWithdrawals,
    });
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do parceiro' },
      { status: 500 }
    );
  }
}
