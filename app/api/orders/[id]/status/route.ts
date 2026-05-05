import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { withAdminAuth } from "@/lib/auth";

type Context = { params: Promise<Record<string, string>> };

export const PATCH = withAdminAuth(async (req: NextRequest, context: Context) => {
  try {
    await connectDB();
    const params = await context.params;
    const id = params.id;

    const { status } = (await req.json()) as { status?: string };

    const validStatuses = ["pending", "paid", "completed", "failed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    console.error("[PATCH /api/orders/[id]/status]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});

