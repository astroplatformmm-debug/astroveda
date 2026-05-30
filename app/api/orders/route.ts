import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import TimeSlot from "@/models/TimeSlot";
import { withAdminAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { userInfo, items, totalAmount, address, bookingSlot } = body;


    console.log("[POST /api/orders] received keys:", Object.keys(body || {}));

    if (!userInfo || typeof userInfo !== "object") {
      return NextResponse.json({ error: "userInfo is required" }, { status: 400 });
    }
    if (!String(userInfo.name || "").trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const phone = String(userInfo.phone || "").trim();
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    // Address fields are optional — use whatever was provided
    const addrPhone = String(address?.phone || phone || "").trim();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const amt = Number(totalAmount);
    if (!Number.isFinite(amt) || amt < 1) {
      return NextResponse.json({ error: "Invalid totalAmount" }, { status: 400 });
    }

    const receipt = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate & lock booking slot for service bookings
    let slotDoc = null;
    if (bookingSlot && bookingSlot.date && bookingSlot.time) {
      slotDoc = await TimeSlot.findOne({ date: bookingSlot.date, time: bookingSlot.time });
      if (!slotDoc) {
        return NextResponse.json({ error: "Selected time slot no longer exists. Please pick another." }, { status: 400 });
      }
      if (slotDoc.isBooked) {
        return NextResponse.json({ error: "This time slot is already booked. Please choose a different slot." }, { status: 409 });
      }
      if (!slotDoc.isEnabled) {
        return NextResponse.json({ error: "This time slot has been disabled. Please choose a different slot." }, { status: 400 });
      }
    }

    const order = await Order.create({
      userInfo: {
        name: String(userInfo.name).trim(),
        email: String(userInfo.email || "").trim(),
        phone,
      },
      address: {
        ...(address || {}),
        fullName: address?.fullName || userInfo.name,
        phone: addrPhone,
      },
      items,
      totalAmount: amt,
      receipt,
      status: "pending",
      bookingSlot: bookingSlot?.date && bookingSlot?.time ? { date: bookingSlot.date, time: bookingSlot.time } : undefined,
    });

    // Mark the slot as booked atomically
    if (slotDoc) {
      await TimeSlot.findByIdAndUpdate(slotDoc._id, {
        isBooked: true,
        bookedByOrderId: order._id,
      });
    }

    console.log("[POST /api/orders] created orderId:", String(order._id), "amount:", amt);
    return NextResponse.json({ orderId: order._id });
  } catch (error: unknown) {
    console.error("[POST /api/orders] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();

    const status = req.nextUrl.searchParams.get("status");
    const query =
      status && ["paid", "pending", "completed", "failed"].includes(status) ? { status } : {};

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("[ORDERS_GET] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
