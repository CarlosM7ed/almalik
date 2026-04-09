import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Create a stock notification request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productId, productName } = body;

    if (!email || !productId || !productName) {
      return NextResponse.json(
        { error: "Email, productId e productName são obrigatórios" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Endereço de email inválido" },
        { status: 400 }
      );
    }

    // Check if this email already has a notification for this product
    const existing = await db.stockNotification.findFirst({
      where: { email: email.toLowerCase(), productId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Já existe uma notificação registada para este produto com este email", existing: true },
        { status: 200 }
      );
    }

    const notification = await db.stockNotification.create({
      data: {
        email: email.toLowerCase(),
        productId,
        productName,
      },
    });

    return NextResponse.json(
      { message: "Notificação registada com sucesso", notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stock notification:", error);
    return NextResponse.json(
      { error: "Erro ao registar notificação" },
      { status: 500 }
    );
  }
}

// GET: Get notifications by productId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const email = searchParams.get("email");

    if (productId) {
      const notifications = await db.stockNotification.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ notifications });
    }

    if (email) {
      const notifications = await db.stockNotification.findMany({
        where: { email: email.toLowerCase() },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ notifications });
    }

    // Return all notifications if no filter
    const notifications = await db.stockNotification.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching stock notifications:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }
}
