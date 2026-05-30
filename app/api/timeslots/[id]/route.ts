import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TimeSlot from "@/models/TimeSlot";
import { withAdminAuth, RouteContext } from "@/lib/auth";
import type { NextRequest } from "next/server";

// PATCH /api/timeslots/[id]  → admin: toggle isEnabled OR unbook a slot
export const PATCH = withAdminAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (typeof body.isEnabled === "boolean") {
      slot.isEnabled = body.isEnabled;
    }

    // Unbook: release the slot and cancel the associated order
    if (body.unbook === true) {
      if (slot.bookedByOrderId) {
        const Order = (await import("@/models/Order")).default;
        await Order.findByIdAndUpdate(slot.bookedByOrderId, { status: "cancelled" });
      }
      slot.isBooked = false;
      slot.bookedByOrderId = undefined;
    }

    await slot.save();
    return NextResponse.json(slot);
  } catch (error: unknown) {
    console.error("[PATCH /api/timeslots/[id]]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
});

// DELETE /api/timeslots/[id]  → admin: delete a slot (only if not booked)
export const DELETE = withAdminAuth(async (req: NextRequest, context: RouteContext) => {
  try {
    await connectDB();
    const { id } = await context.params;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    if (slot.isBooked) {
      return NextResponse.json({ error: "Cannot delete a booked slot" }, { status: 400 });
    }

    await slot.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/timeslots/[id]]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
});
