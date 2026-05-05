"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/admin/login");
            return;
          }
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch order");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: unknown) {
        console.error("[ADMIN_ORDER_DETAIL_FETCH]", err);
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner className="w-10 h-10 text-[#F97316]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{error || "Order not found"}</p>
        <Link href="/admin/orders" className="text-[#F97316] hover:underline font-bold">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to update status");
      }

      setOrder((prev: any) => ({ ...prev, status: newStatus }));

      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      console.error("[ADMIN_ORDER_DETAIL_STATUS]", err);
      setError(err instanceof Error ? err.message : "Status update failed");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-[#64748B] hover:text-[#0F172A] flex items-center mb-2 font-medium">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold font-playfair text-[#0F172A]">Order Details</h1>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h2 className="font-bold text-[#0F172A] text-lg mb-4 font-playfair border-b border-[#E2E8F0] pb-2">Customer Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#64748B]">Full Name</p>
              <p className="font-bold text-[#0F172A]">{order.userInfo?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Email</p>
              <p className="font-bold text-[#0F172A]">{order.userInfo?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Phone</p>
              <p className="font-bold text-[#0F172A]">{order.userInfo?.phone || "N/A"}</p>
            </div>
            {order.address && (
              <div className="pt-2 border-t border-[#E2E8F0]">
                <p className="text-[#64748B]">Address</p>
                <p className="font-medium text-[#0F172A] mt-1">{order.address.addressLine}</p>
                <p className="font-medium text-[#0F172A]">{order.address.city}, {order.address.state} {order.address.pincode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h2 className="font-bold text-[#0F172A] text-lg mb-4 font-playfair border-b border-[#E2E8F0] pb-2">Order Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#64748B]">Order ID</p>
              <p className="font-bold text-[#0F172A]">{order._id}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Date Placed</p>
              <p className="font-bold text-[#0F172A]">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.bookingSlot?.date && order.bookingSlot?.time && (
  <div className="pt-2 border-t border-[#E2E8F0]">
    <p className="text-[#64748B] mb-1">Appointment Slot</p>
    <p className="font-semibold text-[#7C3AED]">
      {new Date(order.bookingSlot.date+"T00:00:00").toLocaleDateString("en-IN",
        {weekday:"long",day:"numeric",month:"long",year:"numeric"})}
    </p>
    <p className="font-bold text-[#D97706]">{order.bookingSlot.time}</p>
  </div>
)}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <p className="text-[#64748B] mb-2">Items</p>
              <ul className="space-y-2">
                {order.items?.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-start">
                    <span className="font-medium text-[#0F172A]">{item.title}</span>
                    <span className="text-[#F97316] font-bold shrink-0 ml-4">₹{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
              <p className="font-bold text-[#0F172A]">Total Amount</p>
              <p className="text-xl font-extrabold text-[#F97316]">₹{order.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h2 className="font-bold text-[#0F172A] text-lg mb-4 font-playfair border-b border-[#E2E8F0] pb-2">Payment Info</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[#64748B] mb-2">Payment Status</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#64748B]">Order Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="text-sm rounded-lg border border-[#E2E8F0] px-3 py-1.5 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[#64748B]">Receipt</p>
              <p className="font-medium text-[#0F172A] break-all">{order.receipt || "N/A"}</p>
            </div>
            {/* Razorpay specific fields would go here if they are saved to the DB. Currently the schema doesn't have them, but typically we add them after verification. */}
            {order.razorpayOrderId && (
              <div>
                <p className="text-[#64748B]">Razorpay Order ID</p>
                <p className="font-bold text-[#0F172A]">{order.razorpayOrderId}</p>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div>
                <p className="text-[#64748B]">Razorpay Payment ID</p>
                <p className="font-bold text-[#0F172A]">{order.razorpayPaymentId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
