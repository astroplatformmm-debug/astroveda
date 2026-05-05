import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TimeSlot from "@/models/TimeSlot";
import { withAdminAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// GET /api/timeslots?date=YYYY-MM-DD  → public: returns enabled+unbooked slots
// GET /api/timeslots?admin=true        → admin: returns all slots (optional date filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const date = req.nextUrl.searchParams.get("date");
    const admin = req.nextUrl.searchParams.get("admin") === "true";

    const query: Record<string, unknown> = {};
    if (date) query.date = date;
    if (!admin) {
      query.isEnabled = true;
      query.isBooked = false;
    }

    const slots = await TimeSlot.find(query).sort({ date: 1, time: 1 });
    return NextResponse.json(slots);
  } catch (error: unknown) {
    console.error("[GET /api/timeslots]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/timeslots  → admin only: create a new slot
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json({ error: "date and time are required" }, { status: 400 });
    }

    // Check for duplicate
    const existing = await TimeSlot.findOne({ date, time });
    if (existing) {
      return NextResponse.json({ error: "Slot already exists for this date and time" }, { status: 409 });
    }

    const slot = await TimeSlot.create({ date, time, isBooked: false, isEnabled: true });
    return NextResponse.json(slot, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/timeslots]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
});
