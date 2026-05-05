"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filterUnread, setFilterUnread] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterUnread ? "/api/contact?unread=true" : "/api/contact";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [filterUnread]);

  const markRead = async (id: string) => {
    await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, isRead: true } : m));
    if (selected?._id === id) setSelected((s) => s ? { ...s, isRead: true } : s);
  };

  const markAllRead = async () => {
    await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAllRead: true }),
    });
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    setSuccessMsg("All messages marked as read");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/contact", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
    setSuccessMsg("Message deleted");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg._id);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? (
              <span className="text-[#F97316] font-semibold">{unreadCount} unread message{unreadCount !== 1 ? "s" : ""}</span>
            ) : (
              "All messages read"
            )}
            {" · "}{messages.length} total
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterUnread((v) => !v)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${filterUnread ? "bg-[#F97316] text-white border-[#F97316]" : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#F97316]"}`}
          >
            {filterUnread ? "Showing Unread" : "Show Unread Only"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-[#F97316] transition-all"
            >
              ✓ Mark All Read
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8 text-[#F97316]" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg font-medium text-[#0F172A]">No messages yet</p>
          <p className="text-gray-400 text-sm mt-1">Contact form submissions will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Message List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {messages.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left px-4 py-4 hover:bg-[#FFF7ED] transition-colors flex items-start gap-3 ${selected?._id === msg._id ? "bg-[#FFF7ED] border-l-4 border-[#F97316]" : ""}`}
                >
                  {/* Unread dot */}
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!msg.isRead ? "bg-[#F97316]" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!msg.isRead ? "font-bold text-[#0F172A]" : "font-medium text-gray-700"}`}>
                        {msg.name}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${!msg.isRead ? "text-[#0F172A] font-medium" : "text-gray-500"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A] font-playfair">{selected.subject}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(selected.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMessage(selected._id)}
                    className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete message"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Sender info */}
                <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-[#F97316] text-sm hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="ml-auto flex-shrink-0 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded-lg hover:bg-[#EA6C0A] transition-colors"
                  >
                    Reply
                  </a>
                </div>

                {/* Message body */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[#0F172A] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {!selected.isRead && (
                  <p className="text-xs text-gray-400 text-center">Message marked as read</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-4xl mb-3">💌</p>
                  <p className="font-medium">Select a message to read it</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
