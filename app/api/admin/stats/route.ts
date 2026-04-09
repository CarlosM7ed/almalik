import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const totalProducts = await db.product.count();
  const totalOrders = await db.order.count();
  const totalRevenue = await db.order.aggregate({ _sum: { total: true } });
  const lowStock = await db.product.count({ where: { stock: { lte: 5 } } });

  // Count unique customers from orders
  const uniqueCustomers = await db.order.groupBy({
    by: ['customerEmail'],
  });
  const totalCustomers = uniqueCustomers.length;

  // Top 5 products by quantity sold with product names
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
        productId: item.productId,
        name: product?.name || 'Unknown',
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.price || 0,
      };
    })
  );

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return NextResponse.json({
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalCustomers,
    lowStock,
    topProducts,
    recentOrders,
  });
}
