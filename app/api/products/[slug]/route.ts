import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Get related products
  const related = await db.product.findMany({
    where: {
      AND: [
        { id: { not: product.id } },
        { OR: [
          { olfactiveFamily: product.olfactiveFamily },
          { gender: product.gender },
          { category: product.category },
        ] },
      ],
    },
    take: 6,
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ product, related });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();
  const { stock } = body;

  if (typeof stock !== 'number' || stock < 0) {
    return NextResponse.json({ error: 'Valid stock number is required' }, { status: 400 });
  }

  try {
    // Try by ID first, then by slug
    const whereClause: { id?: string; slug?: string } = {};
    const productById = await db.product.findUnique({ where: { id: slug } });
    if (productById) {
      whereClause.id = slug;
    } else {
      whereClause.slug = slug;
    }

    const product = await db.product.update({
      where: whereClause,
      data: { stock },
    });

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}
