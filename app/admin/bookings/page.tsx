"use client";

import { useEffect, useState, useMemo } from "react";
import Spinner from "@/components/ui/Spinner";

type SlotInfo = {
  _id: string;
  date: string;
  time: string;
  slotType: "online" | "offline";
  isBooked: boolean;
  isEnabled: boolean;
  bookedByOrderId?: string;
};

type BookingOrder = {
  _id: string;
  userInfo: { name: string; phone: string; email: string };
  items: Array<{ title?: string; itemType: string; price?: number }>;
  totalAmount: number;
  status: string;
  bookingSlot?: { date: string; time: string; slotType?: string };
  createdAt: string;
};

// Full day default times (24hr for input type=time)
const FULL_DAY_TIMES = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

// Convert "HH:MM" → "09:00 AM" style for display
function to12hr(t: string) {
  const [hStr, m] = t.split(":");
  const h = parseInt(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

// Convert stored "09:00 AM" → "09:00" for time input
function to24hr(t: string) {
  if (!t.includes(" ")) return t; // already 24hr
  const [timePart, ampm] = t.split(" ");
  const [hStr, m] = timePart.split(":");
  let h = parseInt(hStr);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

function fmtDateFull(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

// Today's date as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminBookingsPage() {
  const [tab, setTab] = useState<"bookings" | "slots">("bookings");

  // ── Bookings ──
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState("");

  // ── Slots ──
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [slotSuccess, setSlotSuccess] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [filterSlotType, setFilterSlotType] = useState<"all" | "online" | "offline">("all");

  // Add form
  const [newDate, setNewDate] = useState(todayStr());
  const [newTime, setNewTime] = useState("09:00");
  const [newSlotType, setNewSlotType] = useState<"online" | "offline">("online");
  const [addingSlot, setAddingSlot] = useState(false);
  const [addingFullDay, setAddingFullDay] = useState(false);

  // ── Load bookings ──
  useEffect(() => {
    if (tab !== "bookings") return;
    setLoadingBookings(true);
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const all: BookingOrder[] = Array.isArray(data) ? data : [];
        setBookings(
          all.sort((a, b) => {
            if (a.bookingSlot && !b.bookingSlot) return -1;
            if (!a.bookingSlot && b.bookingSlot) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
        );
      })
      .catch(() => setBookingError("Failed to load bookings"))
      .finally(() => setLoadingBookings(false));
  }, [tab]);

  // ── Load slots ──
  const loadSlots = () => {
    setLoadingSlots(true);
    fetch("/api/timeslots?admin=true", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlotError("Failed to load slots"))
      .finally(() => setLoadingSlots(false));
  };

  useEffect(() => {
    if (tab === "slots") loadSlots();
  }, [tab]);

  // Group slots by date, filtered by slotType
  const filteredSlots = useMemo(() => {
    if (filterSlotType === "all") return slots;
    return slots.filter((s) => s.slotType === filterSlotType);
  }, [slots, filterSlotType]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, SlotInfo[]> = {};
    filteredSlots.forEach((s) => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    Object.keys(groups).forEach((d) => {
      groups[d].sort((a, b) => to24hr(a.time).localeCompare(to24hr(b.time)));
    });
    return groups;
  }, [filteredSlots]);

  const allDates = Object.keys(groupedSlots).sort();
  const filteredDates = filterDate === "all" ? allDates : allDates.filter((d) => d === filterDate);

  // ── Add single slot ──
  const handleAddSlot = async () => {
    if (!newDate || !newTime) { setSlotError("Select date and time"); return; }
    setAddingSlot(true);
    setSlotError("");
    setSlotSuccess("");
    const timeFormatted = to12hr(newTime);
    try {
      const res = await fetch("/api/timeslots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, time: timeFormatted, slotType: newSlotType }),
      });
      if (!res.ok) {
        const d = await res.json();
        setSlotError(d.error || "Failed to add slot");
        return;
      }
      setSlotSuccess(`${newSlotType === "online" ? "🌐 Online" : "📍 Offline"} slot added: ${fmtDateFull(newDate)} at ${timeFormatted}`);
      loadSlots();
    } catch {
      setSlotError("Network error");
    } finally {
      setAddingSlot(false);
    }
  };

  // ── Add full day (bulk) ──
  const handleAddFullDay = async () => {
    if (!newDate) { setSlotError("Select a date first"); return; }
    setAddingFullDay(true);
    setSlotError("");
    setSlotSuccess("");
    let added = 0;
    for (const t of FULL_DAY_TIMES) {
      const timeFormatted = to12hr(t);
      try {
        const res = await fetch("/api/timeslots", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: newDate, time: timeFormatted, slotType: newSlotType }),
        });
        if (res.ok) added++;
      } catch { /* skip */ }
    }
    setSlotSuccess(`Added ${added} ${newSlotType} slots for ${fmtDateFull(newDate)}`);
    setAddingFullDay(false);
    loadSlots();
  };

  // ── Toggle enable/disable ──
  const handleToggleSlot = async (slotId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/timeslots/${slotId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !current }),
      });
      if (res.ok) {
        setSlots((prev) => prev.map((s) => s._id === slotId ? { ...s, isEnabled: !current } : s));
      }
    } catch { /* ignore */ }
  };

  // ── Delete slot ──
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Delete this slot?")) return;
    try {
      const res = await fetch(`/api/timeslots/${slotId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
      } else {
        const d = await res.json();
        setSlotError(d.error || "Failed to delete");
      }
    } catch { /* ignore */ }
  };

  // Count stats
  const onlineCount = slots.filter((s) => s.slotType === "online").length;
  const offlineCount = slots.filter((s) => s.slotType === "offline").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings &amp; Time Slots</h1>
        <p className="text-gray-500 text-sm mt-1">Manage service bookings and available time slots.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["bookings", "slots"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              tab === t ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "bookings" ? "📋 All Bookings" : "🕐 Manage Time Slots"}
          </button>
        ))}
      </div>

      {/* ══════════════ BOOKINGS TAB ══════════════ */}
      {tab === "bookings" && (
        <div>
          {bookingError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{bookingError}</div>
          )}
          {loadingBookings ? (
            <div className="flex justify-center py-16"><Spinner className="w-8 h-8 text-purple-600" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No bookings found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Customer", "Phone", "Service", "Booking Date", "Time", "Type", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b._id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{b.userInfo.name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.userInfo.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{b.items.map((i) => i.title || i.itemType).join(", ")}</td>
                      <td className="px-4 py-3">
                        {b.bookingSlot?.date
                          ? <span className="text-purple-700 font-medium">{fmtDateFull(b.bookingSlot.date)}</span>
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {b.bookingSlot?.time
                          ? <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">{b.bookingSlot.time}</span>
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {b.bookingSlot?.slotType ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                            b.bookingSlot.slotType === "online"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}>
                            {b.bookingSlot.slotType === "online" ? "🌐 Online" : "📍 Offline"}
                          </span>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">₹{b.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColor[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ SLOTS TAB ══════════════ */}
      {tab === "slots" && (
        <div className="space-y-6">

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">📅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{slots.length}</div>
                <div className="text-xs text-gray-500 font-medium">Total Slots</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">🌐</div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{onlineCount}</div>
                <div className="text-xs text-blue-500 font-medium">Online Slots</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">📍</div>
              <div>
                <div className="text-2xl font-bold text-orange-700">{offlineCount}</div>
                <div className="text-xs text-orange-500 font-medium">Offline Slots</div>
              </div>
            </div>
          </div>

          {/* ── Add Slots Card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Time Slot Management</h2>
            <p className="text-gray-400 text-sm mb-5">Add and manage your available consultation slots</p>

            {slotError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-3">{slotError}</div>}
            {slotSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-3">✅ {slotSuccess}</div>}

            <div className="font-semibold text-gray-700 text-sm mb-3">Add New Slots</div>

            {/* Slot Type Toggle */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Slot Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewSlotType("online")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    newSlotType === "online"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  🌐 Online
                </button>
                <button
                  type="button"
                  onClick={() => setNewSlotType("offline")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    newSlotType === "offline"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                  }`}
                >
                  📍 Offline
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              {/* Date picker */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={todayStr()}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Time picker */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* Buttons */}
              <button
                onClick={handleAddSlot}
                disabled={addingSlot || !newDate || !newTime}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all whitespace-nowrap"
              >
                {addingSlot ? "Adding…" : "+ Add Slot"}
              </button>
              <button
                onClick={handleAddFullDay}
                disabled={addingFullDay || !newDate}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-xl text-sm transition-all whitespace-nowrap"
              >
                {addingFullDay ? "Adding…" : "Add Full Day"}
              </button>
            </div>
          </div>

          {/* ── Slot Type Filter ── */}
          <div className="flex gap-2">
            {(["all", "online", "offline"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterSlotType(type)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  filterSlotType === type
                    ? type === "online"
                      ? "bg-blue-500 text-white border-blue-500"
                      : type === "offline"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {type === "all" ? "All Types" : type === "online" ? "🌐 Online" : "📍 Offline"}
              </button>
            ))}
          </div>

          {/* ── Date filter pills ── */}
          {allDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterDate("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  filterDate === "all"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-400"
                }`}
              >
                All Dates
              </button>
              {allDates.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDate(d)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    filterDate === d
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* ── Slots grouped by date ── */}
          {loadingSlots ? (
            <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-purple-600" /></div>
          ) : allDates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 text-center py-12 text-gray-400 text-sm">
              No slots found. Add some above.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDates.map((date) => {
                const dateSlots = groupedSlots[date];
                const onlineSlots = dateSlots.filter((s) => s.slotType === "online");
                const offlineSlots = dateSlots.filter((s) => s.slotType === "offline");
                return (
                  <div key={date} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-amber-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="font-bold text-gray-900">{date}</span>
                      <span className="text-gray-400 text-sm">{dateSlots.length} slot{dateSlots.length !== 1 ? "s" : ""}</span>
                      {onlineSlots.length > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{onlineSlots.length} online</span>
                      )}
                      {offlineSlots.length > 0 && (
                        <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">{offlineSlots.length} offline</span>
                      )}
                    </div>

                    {/* Online slots section */}
                    {onlineSlots.length > 0 && (filterSlotType === "all" || filterSlotType === "online") && (
                      <div className="mb-3">
                        <div className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                          🌐 Online Slots
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {onlineSlots.map((s) => (
                            <SlotChip key={s._id} slot={s} onToggle={handleToggleSlot} onDelete={handleDeleteSlot} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Offline slots section */}
                    {offlineSlots.length > 0 && (filterSlotType === "all" || filterSlotType === "offline") && (
                      <div>
                        <div className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1">
                          📍 Offline Slots
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {offlineSlots.map((s) => (
                            <SlotChip key={s._id} slot={s} onToggle={handleToggleSlot} onDelete={handleDeleteSlot} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slot Chip Component ──
function SlotChip({
  slot,
  onToggle,
  onDelete,
}: {
  slot: SlotInfo;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
        slot.isBooked
          ? "bg-red-50 border-red-200 text-red-700"
          : slot.isEnabled
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-gray-100 border-gray-200 text-gray-500"
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{slot.time}</span>

      {slot.isBooked ? (
        <span className="text-xs text-red-400 font-semibold">Booked</span>
      ) : (
        <>
          <button
            onClick={() => onToggle(slot._id, slot.isEnabled)}
            className="text-xs underline hover:no-underline transition-all ml-1"
          >
            {slot.isEnabled ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => onDelete(slot._id)}
            className="hover:text-red-600 transition-colors ml-0.5"
            title="Delete slot"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
