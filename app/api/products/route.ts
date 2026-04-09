import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const gender = searchParams.get('gender');
  const intensity = searchParams.get('intensity');
  const occasion = searchParams.get('occasion');
  const timeOfDay = searchParams.get('timeOfDay');
  const olfactiveFamily = searchParams.get('olfactiveFamily');
  const fixation = searchParams.get('fixation');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured') || searchParams.get('isFeatured');
  const isNew = searchParams.get('new') || searchParams.get('isNew');
  const bestseller = searchParams.get('bestseller') || searchParams.get('isBestseller');
  const kits = searchParams.get('kits') || searchParams.get('isKit');
  const sort = searchParams.get('sort') || 'sortOrder';
  const limit = parseInt(searchParams.get('limit') || '50');
  const page = parseInt(searchParams.get('page') || '1');

  const ids = searchParams.get('ids');

  const where: any = {};

  if (ids) {
    where.id = { in: ids.split(',') };
  }
  if (category && category !== 'all') where.category = category;
  if (gender && gender !== 'all') where.gender = gender;
  if (intensity && intensity !== 'all') where.intensity = intensity;
  if (occasion && occasion !== 'all') where.occasion = occasion;
  if (timeOfDay && timeOfDay !== 'all') where.timeOfDay = timeOfDay;
  if (olfactiveFamily && olfactiveFamily !== 'all') where.olfactiveFamily = olfactiveFamily;
  if (fixation && fixation !== 'all') where.fixation = fixation;
  if (featured === 'true') where.isFeatured = true;
  if (isNew === 'true') where.isNew = true;
  if (bestseller === 'true') where.isBestseller = true;
  if (kits === 'true') where.isKit = true;
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { notesKey: { contains: search } },
    ];
  }

  const products = await db.product.findMany({
    where,
    orderBy: sort === 'price_asc' ? { price: 'asc' } :
             sort === 'price_desc' ? { price: 'desc' } :
             sort === 'name' ? { name: 'asc' } :
             sort === 'newest' ? { createdAt: 'desc' } :
             { sortOrder: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.product.count({ where });

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}
