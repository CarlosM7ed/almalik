import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  // Set to start of day
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all orders from the last 7 days
  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group orders by date
  const revenueByDate = new Map<string, { revenue: number; orders: number }>();

  // Initialize all 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    revenueByDate.set(dateKey, { revenue: 0, orders: 0 });
  }

  // Aggregate order totals into their respective dates
  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    const existing = revenueByDate.get(dateKey);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      revenueByDate.set(dateKey, { revenue: order.total, orders: 1 });
    }
  }

  // Build the response array
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = revenueByDate.get(dateKey) || { revenue: 0, orders: 0 };

    data.push({
      date: dateKey,
      label: date.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' }),
      revenue: Math.round(dayData.revenue * 100) / 100,
      orders: dayData.orders,
    });
  }

  return NextResponse.json({ data });
}
