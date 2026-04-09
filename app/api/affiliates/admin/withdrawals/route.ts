import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/affiliates/admin/withdrawals — List all withdrawal requests
export async function GET() {
  try {
    const withdrawals = await db.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar saques' },
      { status: 500 }
    );
  }
}

// PUT /api/affiliates/admin/withdrawals — Update withdrawal status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const withdrawal = await db.withdrawal.findUnique({ where: { id } });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Saque não encontrado' }, { status: 404 });
    }

    // If rejecting, return amount to affiliate balance
    if (status === 'rejected' && withdrawal.status === 'pending') {
      await db.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          balance: { increment: withdrawal.amount },
          totalWithdrawn: { decrement: withdrawal.amount },
        },
      });
    }

    const updated = await db.withdrawal.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ withdrawal: updated });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar saque' },
      { status: 500 }
    );
  }
}
