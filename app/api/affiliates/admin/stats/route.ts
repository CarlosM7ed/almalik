import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/affiliates/admin/stats — Financial summary for admin
export async function GET() {
  try {
    const ordersResult = await db.order.aggregate({
      _sum: { total: true },
      _count: true,
    });

    const grossRevenue = ordersResult._sum.total || 0;
    const totalOrders = ordersResult._count || 0;

    const orderItems = await db.orderItem.findMany({
      include: { product: { select: { costPrice: true } } },
    });

    let totalCosts = 0;
    for (const item of orderItems) {
      totalCosts += item.product.costPrice * item.quantity;
    }

    const commissionsResult = await db.commission.aggregate({
      _sum: { amount: true },
      where: { status: 'pending' },
    });

    const pendingCommissions = commissionsResult._sum.amount || 0;

    const paidCommissionsResult = await db.commission.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' },
    });

    const paidCommissions = paidCommissionsResult._sum.amount || 0;
    const totalCommissions = pendingCommissions + paidCommissions;

    const netProfit = grossRevenue - totalCosts - totalCommissions;

    const directOrders = await db.order.count({
      where: { affiliateRef: '' },
    });

    const affiliateOrders = await db.order.count({
      where: { affiliateRef: { not: '' } },
    });

    const affiliateOrdersData = await db.order.findMany({
      where: { affiliateRef: { not: '' } },
    });

    const affiliateRevenue = affiliateOrdersData.reduce((sum, o) => sum + o.total, 0);

    const lowStockProducts = await db.product.count({
      where: { stock: { lte: 5, gt: 0 } },
    });

    const outOfStockProducts = await db.product.count({
      where: { stock: 0 },
    });

    const activeAffiliates = await db.affiliate.count({
      where: { isActive: true },
    });

    const pendingWithdrawals = await db.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: 'pending' },
    });

    return NextResponse.json({
      grossRevenue,
      totalCosts,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      netProfit,
      totalOrders,
      directOrders,
      affiliateOrders,
      affiliateRevenue,
      lowStockProducts,
      outOfStockProducts,
      activeAffiliates,
      pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
