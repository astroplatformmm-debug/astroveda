import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import { withAdminAuth, RouteContext } from "@/lib/auth";

// ── PATCH /api/admin/reviews/[id]  ─ approve/reject/edit/feature ───────────
export const PATCH = withAdminAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();
    const { status, featured, name, rating, message } = body;

    const update: Record<string, unknown> = {};
    if (status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
    }
    if (featured !== undefined) update.featured = Boolean(featured);
    if (name !== undefined) update.name = String(name).trim().slice(0, 100);
    if (rating !== undefined) {
      const r = Number(rating);
      if (r < 1 || r > 5)
        return NextResponse.json({ error: "Rating 1-5 only" }, { status: 400 });
      update.rating = r;
    }
    if (message !== undefined)
      update.message = String(message).trim().slice(0, 1000);

    const review = await Review.findByIdAndUpdate(id, update, { new: true });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
});

// ── DELETE /api/admin/reviews/[id]  ─ delete a review ─────────────────────
export const DELETE = withAdminAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
});
