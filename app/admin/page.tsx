"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import OrdersTable from "@/components/admin/OrdersTable";
import Spinner from "@/components/ui/Spinner";
import type { Order } from "@/lib/types";

function BookingsSummary() {
  const [bookings, setBookings] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const all: Order[] = Array.isArray(data) ? data : [];
        const upcoming = all
          .filter((o) => o.bookingSlot?.date && o.bookingSlot?.time && o.status !== "failed")
          .sort((a, b) => (a.bookingSlot!.date > b.bookingSlot!.date ? 1 : -1))
          .slice(0, 5);
        setBookings(upcoming);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 flex justify-center"><Spinner className="w-6 h-6 text-purple-600" /></div>;
  if (bookings.length === 0) return <div className="px-6 py-8 text-gray-400 text-sm text-center">No upcoming bookings.</div>;

  return (
    <div className="divide-y divide-gray-50">
      {bookings.map((b) => (
        <div key={b._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{b.userInfo.name}</p>
            <p className="text-xs text-gray-400">{b.userInfo.phone}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-purple-700">
              {new Date(b.bookingSlot!.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-xs text-amber-600 font-bold">{b.bookingSlot!.time}</p>
          </div>
          <div>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${
              b.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
              b.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            }`}>{b.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [] as Order[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const extractErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      return body.error || `Request failed: ${response.status}`;
    } catch {
      return `Request failed: ${response.status}`;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        if (!res.ok) {
          throw new Error(await extractErrorMessage(res));
        }
        const data = await res.json();
        setStats(data);
      } catch (err: unknown) {
        console.error("Stats fetch failed:", err);
        setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

      setStats((prev) => ({
        ...prev,
        recentOrders: prev.recentOrders.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o)),
      }));

      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Status update failed:", err);
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-playfair text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={`${stats.totalOrders}`}
          trend="+12%"
          trendDirection="up"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          trend="+5%"
          trendDirection="up"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <StatCard
          title="Pending Orders"
          value={`${stats.pendingOrders}`}
          trend="-2%"
          trendDirection="down"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Completed Orders"
          value={`${stats.completedOrders}`}
          trend="+0%"
          trendDirection="up"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      </div>

      {/* Bookings Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 font-playfair">📅 Upcoming Service Bookings</h2>
          <a href="/admin/bookings" className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors">
            Manage Slots →
          </a>
        </div>
        <BookingsSummary />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 font-playfair">Recent Orders</h2>
        </div>
        
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="w-8 h-8 text-[#7C3AED]" />
          </div>
        ) : (
          <>
            <OrdersTable orders={stats.recentOrders} onStatusChange={handleStatusChange} />
          </>
        )}
      </div>
    </div>
  );
}
