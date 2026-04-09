import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/affiliates — Create a new affiliate (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, commissionRate } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const existing = await db.affiliate.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um parceiro com este email' },
        { status: 400 }
      );
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    for (let i = 0; i < 8; i++) {
      referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let codeExists = await db.affiliate.findUnique({ where: { referralCode } });
    while (codeExists) {
      referralCode = '';
      for (let i = 0; i < 8; i++) {
        referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codeExists = await db.affiliate.findUnique({ where: { referralCode } });
    }

    const affiliate = await db.affiliate.create({
      data: {
        name,
        email,
        password,
        referralCode,
        commissionRate: commissionRate || 0.3,
      },
    });

    const { password: _, ...affiliateData } = affiliate;
    return NextResponse.json({ affiliate: affiliateData }, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json(
      { error: 'Erro ao criar parceiro' },
      { status: 500 }
    );
  }
}

// GET /api/affiliates — List all affiliates (admin)
export async function GET() {
  try {
    const affiliates = await db.affiliate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { commissions: true, withdrawals: true },
        },
      },
    });

    const safeAffiliates = affiliates.map(({ password: _, ...rest }) => rest);
    return NextResponse.json({ affiliates: safeAffiliates });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar parceiros' },
      { status: 500 }
    );
  }
}

// PUT /api/affiliates — Update affiliate
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, commissionRate } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;

    const affiliate = await db.affiliate.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...affiliateData } = affiliate;
    return NextResponse.json({ affiliate: affiliateData });
  } catch (error) {
    console.error('Error updating affiliate:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar parceiro' },
      { status: 500 }
    );
  }
}
