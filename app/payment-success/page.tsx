"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import type { Order } from "@/lib/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error("Failed to load order");
        }
        const data = (await res.json()) as Order;
        setOrder(data);

        // Meta Pixel - Track Purchase event
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Purchase", {
            value: data.totalAmount,
            currency: "INR",
            order_id: data._id,
          });
        }
      } catch (err: unknown) {
        console.error("Payment success order fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
        
        {/* Animated Checkmark */}
        <div className="mx-auto w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-green-500 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white animate-[bounce_1s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">Thank you for your purchase.</p>

        {loading ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100 flex justify-center">
            <Spinner className="w-8 h-8 text-[#7C3AED]" />
          </div>
        ) : order ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-500 text-sm">Order ID</span>
              <span className="font-mono font-bold text-gray-800">{order._id}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-500 text-sm">Customer Name</span>
              <span className="font-semibold text-gray-800">{order.userInfo?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-500 text-sm">Item</span>
              <span className="font-semibold text-[#7C3AED] max-w-[150px] truncate">
                {order.items?.map((item) => item.title).filter(Boolean).join(", ")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500 text-sm font-bold">Total Paid</span>
              <span className="font-bold text-xl text-[#D97706]">₹{order.totalAmount}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <p className="text-gray-600">Your order details have been sent to your email.</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex justify-center w-full px-6 py-3.5 bg-[#1E1B4B] hover:bg-[#4C1D95] text-white font-medium rounded-xl transition-colors shadow-md"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gray-50">
          <Spinner className="w-10 h-10 text-[#7C3AED]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
