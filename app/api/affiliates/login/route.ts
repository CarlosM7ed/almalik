import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/affiliates/login — Affiliate login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const affiliate = await db.affiliate.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Support both hashed and plain-text passwords for backwards compatibility
    const isPasswordValid = affiliate.password.startsWith('$2')
      ? await bcrypt.compare(password, affiliate.password)
      : password === affiliate.password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!affiliate.isActive) {
      return NextResponse.json(
        { error: 'Conta desativada. Contacte o administrador.' },
        { status: 403 }
      );
    }

    const { password: _, ...affiliateData } = affiliate;
    return NextResponse.json({ affiliate: affiliateData });
  } catch (error) {
    console.error('Error logging in affiliate:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
