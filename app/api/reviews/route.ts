import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reviews?productId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, author, rating, title, comment } = body;

    // Validation
    const errors: string[] = [];

    if (!productId || typeof productId !== "string") {
      errors.push("productId is required");
    }
    if (!author || typeof author !== "string" || author.trim().length < 2) {
      errors.push("Author name is required (min 2 characters)");
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }
    if (
      !comment ||
      typeof comment !== "string" ||
      comment.trim().length < 10
    ) {
      errors.push("Comment is required (min 10 characters)");
    }
    if (title && typeof title !== "string") {
      errors.push("Title must be a string");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId,
        productName: productName || "",
        author: author.trim(),
        rating: Math.round(rating),
        title: (title || "").trim(),
        comment: comment.trim(),
        verified: false,
        helpful: 0,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
