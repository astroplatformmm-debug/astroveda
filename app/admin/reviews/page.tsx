"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";

interface Review {
  _id: string;
  name: string;
  email?: string;
  rating: number;
  message: string;
  profile_image?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  ip_address?: string;
  created_at: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; rating: number; message: string }>({
    name: "",
    rating: 5,
    message: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch {
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const patchReview = async (id: string, body: Record<string, unknown>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      showToast("Review updated successfully");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      showToast("Review deleted");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (r: Review) => {
    setEditingId(r._id);
    setEditData({ name: r.name, rating: r.rating, message: r.message });
  };

  const saveEdit = async (id: string) => {
    await patchReview(id, editData);
    setEditingId(null);
  };

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold font-playfair text-gray-900">
          Reviews Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Approve, reject, edit, feature or delete customer reviews.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
              filter === tab
                ? "bg-[#F97316] text-white border-[#F97316] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#F97316] hover:text-[#F97316]"
            }`}
          >
            {tab === "all" ? "All Reviews" : tab}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab ? "bg-white/20" : "bg-gray-100"
              }`}
            >
              {/* counts are based on loaded set for non-all */}
              {tab === "all"
                ? reviews.length
                : reviews.filter((r) => r.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner className="w-8 h-8 text-[#F97316]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Rating</th>
                  <th className="px-5 py-4 font-medium">Review</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-center">Featured</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {review.profile_image ? (
                          <img
                            src={review.profile_image}
                            alt={review.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                            {review.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          {editingId === review._id ? (
                            <input
                              value={editData.name}
                              onChange={(e) =>
                                setEditData((d) => ({ ...d, name: e.target.value }))
                              }
                              className="border border-gray-200 rounded px-2 py-1 text-xs w-28 focus:border-orange-400 outline-none"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900">
                              {review.name}
                            </p>
                          )}
                          {review.email && (
                            <p className="text-xs text-gray-400">{review.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4">
                      {editingId === review._id ? (
                        <select
                          value={editData.rating}
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              rating: Number(e.target.value),
                            }))
                          }
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:border-orange-400 outline-none"
                        >
                          {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>
                              {r} ★
                            </option>
                          ))}
                        </select>
                      ) : (
                        <StarDisplay rating={review.rating} />
                      )}
                    </td>

                    {/* Review message */}
                    <td className="px-5 py-4 max-w-xs">
                      {editingId === review._id ? (
                        <textarea
                          value={editData.message}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, message: e.target.value }))
                          }
                          rows={2}
                          className="border border-gray-200 rounded px-2 py-1 text-xs w-56 focus:border-orange-400 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">
                          {review.message}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <select
                        value={review.status}
                        disabled={actionLoading === review._id}
                        onChange={(e) =>
                          patchReview(review._id, { status: e.target.value })
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer focus:outline-none ${STATUS_COLORS[review.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Featured */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() =>
                          patchReview(review._id, { featured: !review.featured })
                        }
                        disabled={actionLoading === review._id}
                        className={`w-8 h-8 rounded-full transition-all flex items-center justify-center mx-auto ${
                          review.featured
                            ? "bg-amber-400 text-white shadow-sm"
                            : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-500"
                        }`}
                        title={review.featured ? "Unfeature" : "Feature"}
                      >
                        ★
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {editingId === review._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(review._id)}
                              disabled={actionLoading === review._id}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Quick Approve */}
                            {review.status !== "approved" && (
                              <button
                                onClick={() =>
                                  patchReview(review._id, { status: "approved" })
                                }
                                disabled={actionLoading === review._id}
                                className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                                title="Approve"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {/* Quick Reject */}
                            {review.status !== "rejected" && (
                              <button
                                onClick={() =>
                                  patchReview(review._id, { status: "rejected" })
                                }
                                disabled={actionLoading === review._id}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                title="Reject"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                            {/* Edit */}
                            <button
                              onClick={() => startEdit(review)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => deleteReview(review._id)}
                              disabled={actionLoading === review._id}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                        {actionLoading === review._id && (
                          <Spinner className="w-4 h-4 text-[#F97316]" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
