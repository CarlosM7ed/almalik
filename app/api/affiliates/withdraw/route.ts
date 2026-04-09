import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/affiliates/withdraw — Request a withdrawal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateId, amount, iban, accountHolder, notes } = body;

    if (!affiliateId || !amount) {
      return NextResponse.json(
        { error: 'ID do parceiro e valor são obrigatórios' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'O valor deve ser superior a 0' },
        { status: 400 }
      );
    }

    const affiliate = await db.affiliate.findUnique({ where: { id: affiliateId } });

    if (!affiliate) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    if (affiliate.balance < amount) {
      return NextResponse.json(
        { error: 'Saldo insuficiente para este saque' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await db.withdrawal.create({
      data: {
        affiliateId,
        amount,
        iban: iban || '',
        accountHolder: accountHolder || '',
        notes: notes || '',
      },
    });

    // Deduct from balance
    await db.affiliate.update({
      where: { id: affiliateId },
      data: {
        balance: { decrement: amount },
        totalWithdrawn: { increment: amount },
      },
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Erro ao solicitar saque' },
      { status: 500 }
    );
  }
}
