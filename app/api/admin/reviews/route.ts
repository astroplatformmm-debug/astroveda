import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import { withAdminAuth } from "@/lib/auth";

// ── GET /api/admin/reviews  ─ list all reviews ─────────────────────────────
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending | approved | rejected | all
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const reviews = await Review.find(filter)
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
});
