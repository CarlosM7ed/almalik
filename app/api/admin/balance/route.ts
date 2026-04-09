import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // ── Stock Valuation ──
  const allProducts = await db.product.findMany({
    select: { costPrice: true, price: true, stock: true },
  });

  let totalStockValue = 0;
  let totalRetailValue = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  for (const p of allProducts) {
    totalStockValue += p.costPrice * p.stock;
    totalRetailValue += p.price * p.stock;
    if (p.stock <= 5) lowStockProducts++;
    if (p.stock === 0) outOfStockProducts++;
  }

  // ── Orders Summary ──
  const allOrders = await db.order.findMany({
    select: {
      total: true,
      status: true,
      customerEmail: true,
      customerName: true,
      affiliateRef: true,
      createdAt: true,
      id: true,
      items: { select: { productId: true, quantity: true, price: true } },
    },
  });

  let totalRevenue = 0;
  let pendingRevenue = 0;
  let cancelledRevenue = 0;
  let totalOrders = allOrders.length;
  let deliveredOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;
  let affiliateRevenue = 0;

  const statusSet = new Set(['delivered', 'shipped']);
  const pendingStatusSet = new Set(['pending', 'confirmed']);

  for (const order of allOrders) {
    if (statusSet.has(order.status)) {
      totalRevenue += order.total;
      if (order.status === 'delivered') deliveredOrders++;
    }
    if (pendingStatusSet.has(order.status)) {
      pendingRevenue += order.total;
      pendingOrders++;
    }
    if (order.status === 'cancelled') {
      cancelledRevenue += order.total;
      cancelledOrders++;
    }
    if (order.affiliateRef) {
      affiliateRevenue += order.total;
    }
  }

  // ── Average Metrics ──
  const averageTicket = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

  // ── Commissions Summary ──
  const allCommissions = await db.commission.findMany({
    select: { amount: true, status: true },
  });

  let totalCommissionsPaid = 0;
  let totalCommissionsPending = 0;
  let totalCommissions = 0;

  for (const c of allCommissions) {
    totalCommissions += c.amount;
    if (c.status === 'paid') totalCommissionsPaid += c.amount;
    if (c.status === 'pending') totalCommissionsPending += c.amount;
  }

  // ── Affiliate Summary ──
  const totalAffiliates = await db.affiliate.count();
  const activeAffiliates = await db.affiliate.count({ where: { isActive: true } });

  // ── Cost Calculation (costPrice * quantity for all order items) ──
  let totalCosts = 0;
  const productCostMap = new Map<string, number>();

  for (const p of allProducts) {
    productCostMap.set(p.costPrice.toString(), p.costPrice);
  }

  // Fetch all order items with product costPrices
  const allOrderItems = await db.orderItem.findMany({
    select: { quantity: true, price: true, product: { select: { costPrice: true } } },
  });

  for (const item of allOrderItems) {
    totalCosts += (item.product?.costPrice || 0) * item.quantity;
  }

  // ── Financial Summary ──
  const netProfit = totalRevenue - totalCosts - totalCommissionsPaid;
  const amountsToReceive = pendingRevenue;
  const amountsToPay = totalCommissionsPending;

  // ── Recent Orders (last 5) ──
  const recentOrders = allOrders
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      affiliateRef: o.affiliateRef,
    }));

  // ── Top Products by quantity sold ──
  const topProductGroups = await db.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const topProducts = await Promise.all(
    topProductGroups.map(async (item) => {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { name: true },
      });
      return {
        name: product?.name || 'Unknown',
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.price || 0,
      };
    })
  );

  return NextResponse.json({
    // Stock Valuation
    totalStockValue: Math.round(totalStockValue * 100) / 100,
    totalRetailValue: Math.round(totalRetailValue * 100) / 100,
    lowStockProducts,
    outOfStockProducts,

    // Sales Summary
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingRevenue: Math.round(pendingRevenue * 100) / 100,
    cancelledRevenue: Math.round(cancelledRevenue * 100) / 100,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    cancelledOrders,

    // Average Metrics
    averageTicket: Math.round(averageTicket * 100) / 100,

    // Affiliate & Commission Summary
    totalCommissionsPaid: Math.round(totalCommissionsPaid * 100) / 100,
    totalCommissionsPending: Math.round(totalCommissionsPending * 100) / 100,
    totalCommissions: Math.round(totalCommissions * 100) / 100,
    activeAffiliates,
    totalAffiliates,
    affiliateRevenue: Math.round(affiliateRevenue * 100) / 100,

    // Financial Summary
    totalCosts: Math.round(totalCosts * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    amountsToReceive: Math.round(amountsToReceive * 100) / 100,
    amountsToPay: Math.round(amountsToPay * 100) / 100,

    // Recent Data
    recentOrders,
    topProducts,
  });
}
