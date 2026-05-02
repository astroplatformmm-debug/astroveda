import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/razorpaySecret";

type RzpPayment = {
  id?: string;
  status?: string;
  captured?: boolean;
  amount?: number;
  created_at?: number;
};

function paymentScore(p: RzpPayment): number {
  const st = String(p.status || "").toLowerCase();
  if (p.captured === true || st === "captured") return 2;
  if (st === "authorized") return 1;
  return 0;
}

/** Pick the best successful payment; `expectedPaise <= 0` skips amount matching (fallback when Razorpay order is already `paid`). */
function pickPayablePayment(items: RzpPayment[], expectedPaise: number): RzpPayment | undefined {
  const candidates = items.filter((p) => {
    if (!p?.id) return false;
    const st = String(p.status || "").toLowerCase();
    if (st === "failed" || st === "refunded") return false;
    return paymentScore(p) > 0;
  });

  const matchAmount = (p: RzpPayment) =>
    expectedPaise <= 0 || !Number.isFinite(expectedPaise) || Number(p.amount) === expectedPaise;

  const filtered = candidates.filter(matchAmount);
  const pool = filtered.length > 0 ? filtered : expectedPaise > 0 ? [] : candidates;

  const ranked = [...pool].sort((a, b) => {
    const d = paymentScore(b) - paymentScore(a);
    if (d !== 0) return d;
    return (b.created_at || 0) - (a.created_at || 0);
  });
  return ranked[0];
}

/**
 * Server-side reconciliation for UPI flows where Razorpay handler doesn't fire.
 * Uses Razorpay order status + payments list (with count) to mark Order as paid.
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = (await req.json()) as { orderId?: string };
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ paid: true, orderId });

    const rpOrderId = typeof order.razorpayOrderId === "string" ? order.razorpayOrderId.trim() : "";
    if (!rpOrderId) {
      return NextResponse.json({ paid: false, orderId, status: order.status, reason: "missing_razorpay_order_id" });
    }

    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const api = (razorpay as unknown as { api: { get: (p: { url: string; data?: Record<string, unknown> }) => Promise<unknown> } }).api;

    const rpOrder = (await razorpay.orders.fetch(rpOrderId)) as {
      status?: string;
      amount?: number;
      amount_paid?: number;
    };

    const paymentsResp = (await api.get({
      url: `/orders/${rpOrderId}/payments`,
      data: { count: 100 },
    })) as { items?: RzpPayment[] };

    const items: RzpPayment[] = Array.isArray(paymentsResp?.items) ? paymentsResp.items : [];
    const expectedPaise = Math.round(Number(order.totalAmount) * 100);

    let chosen = pickPayablePayment(items, Number.isFinite(expectedPaise) ? expectedPaise : 0);

    const rpOrderStatus = typeof rpOrder?.status === "string" ? rpOrder.status : "";
    if (!chosen && rpOrderStatus === "paid") {
      chosen = pickPayablePayment(items, 0);
    }

    if (!chosen) {
      return NextResponse.json({
        paid: false,
        orderId,
        razorpayOrderId: rpOrderId,
        razorpayOrderStatus: rpOrderStatus || undefined,
        paymentCount: items.length,
        paymentStatuses: items.map((p) => String(p.status || "")).filter(Boolean),
      });
    }

    const paymentId = String(chosen.id || "").trim();
    if (!paymentId) {
      return NextResponse.json({
        paid: false,
        orderId,
        razorpayOrderId: rpOrderId,
        reason: "missing_payment_id",
        razorpayOrderStatus: rpOrderStatus || undefined,
        paymentCount: items.length,
      });
    }

    const existing = await Payment.findOne({ orderId, razorpay_payment_id: paymentId, status: "success" });

    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      razorpayPaymentId: paymentId,
      razorpayOrderId: rpOrderId,
    });

    if (!existing) {
      await Payment.create({
        orderId,
        razorpay_order_id: rpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: undefined,
        status: "success",
      });
    }

    return NextResponse.json({ paid: true, orderId, razorpay_payment_id: paymentId });
  } catch (error: unknown) {
    console.error("[PAYMENT_POLL] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
