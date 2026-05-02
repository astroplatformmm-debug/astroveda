import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/razorpaySecret";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { orderId, amount } = await req.json();
    const numericAmount = Number(amount);
    console.log("[CREATE-ORDER] orderId:", orderId, "amount:", amount);
    console.log("[CREATE-ORDER] RAZORPAY_KEY_ID set:", !!process.env.RAZORPAY_KEY_ID);
    console.log("[CREATE-ORDER] RAZORPAY_SECRET set:", !!process.env.RAZORPAY_SECRET);
    console.log("[CREATE-ORDER] RAZORPAY_KEY_SECRET set:", !!process.env.RAZORPAY_KEY_SECRET);

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      console.warn("[POST /api/payment/create-order] Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (existingOrder.status === "paid") {
      console.log("[POST /api/payment/create-order] Order already paid:", orderId);
      return NextResponse.json({ error: "Order is already paid." }, { status: 400 });
    }
    if (!numericAmount || numericAmount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum order value is ₹1." },
        { status: 400 },
      );
    }

    const orderAmount = Number(existingOrder.totalAmount);
    if (
      Number.isFinite(orderAmount) &&
      Math.round(numericAmount * 100) !== Math.round(orderAmount * 100)
    ) {
      console.warn("[POST /api/payment/create-order] Amount mismatch order:", orderId);
      return NextResponse.json({ error: "Amount does not match order." }, { status: 400 });
    }

    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server." },
        { status: 500 },
      );
    }
    if (!keyId.startsWith("rzp_")) {
      return NextResponse.json(
        { error: "Invalid RAZORPAY_KEY_ID. It should start with rzp_test_ or rzp_live_." },
        { status: 500 },
      );
    }
    if (keyId === keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys look misconfigured (key id and secret are identical)." },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: String(orderId),
    });

    // Persist Razorpay order id so server-side polling can reconcile UPI payments.
    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: unknown) {
    // Razorpay errors are often objects (not Error instances)
    console.error("[POST /api/payment/create-order] error:", error);
    const anyErr = error as any;
    const description =
      anyErr?.error?.description ||
      anyErr?.description ||
      anyErr?.message ||
      "Internal server error";
    return NextResponse.json(
      { error: description },
      { status: 500 },
    );
  }
}
