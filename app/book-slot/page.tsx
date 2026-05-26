"use client";
import { useLanguage } from "@/context/LanguageContext";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";

type SlotInfo = {
  _id: string;
  date: string;
  time: string;
  isBooked: boolean;
  isEnabled: boolean;
};

function buildAvailableDates(): string[] {
  const dates: string[] = [];
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  cur.setDate(cur.getDate() + 1);
  while (dates.length < 14) {
    if (cur.getDay() !== 0) {
      dates.push(cur.toISOString().split("T")[0]);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function fmtLabel(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtFull(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BookSlotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const serviceId = searchParams.get("serviceId") || "";
  const serviceTitle = searchParams.get("title") || "Service";
  const servicePrice = searchParams.get("price") || "";

  const availableDates = buildAvailableDates();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    setError("");
    fetch(`/api/timeslots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load time slots. Please try again."))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleContinue = () => {
    if (!selectedDate) { setError("{t("Please select a date.", "कृपया तारीख चुनें।")}"); return; }
    if (!selectedTime) { setError("{t("Please select a time slot.", "कृपया समय स्लॉट चुनें।")}"); return; }
    const params = new URLSearchParams({
      serviceId,
      date: selectedDate,
      time: selectedTime,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const timeSlotsForDate = slots.filter((s) => s.isEnabled && !s.isBooked);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          href={serviceId ? `/services/${serviceId}` : "/services"}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to service
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("Select Date & Time", "तारीख और समय चुनें")}</h1>
          <p className="text-gray-500 text-sm">
            {t("Booking for:", "बुकिंग:")} <span className="font-semibold text-purple-700">{decodeURIComponent(serviceTitle)}</span>
            {servicePrice && <span className="ml-2 text-amber-600 font-bold">₹{servicePrice}</span>}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 text-xs font-semibold text-gray-400">
          <span className="text-purple-700 font-bold">{t("1. Service", "1. सेवा")}</span>
          <span className="text-gray-300">→</span>
          <span className="text-purple-700 font-bold underline">{t("2. Date & Time", "2. तारीख और समय")}</span>
          <span className="text-gray-300">→</span>
          <span>{t("3. Checkout", "3. चेकआउट")}</span>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t("Choose a Date", "तारीख चुनें")}</h2>
          <p className="text-xs text-gray-400 mb-4">{t("Sundays excluded. Showing next 14 available days.", "रविवार को छोड़कर। अगले 14 उपलब्ध दिन दिखाए जा रहे हैं।")}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setSelectedDate(d); setError(""); }}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border text-xs font-semibold transition-all
                  ${selectedDate === d
                    ? "bg-purple-600 text-white border-purple-600 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                  }`}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className="text-base font-bold leading-tight">
                  {new Date(d + "T00:00:00").getDate()}
                </span>
                <span className="text-[10px] opacity-70">
                  {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {t("Available Times for", "उपलब्ध समय:")}{" "}
              <span className="text-purple-700">{fmtFull(selectedDate)}</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">{t("All times are in Indian Standard Time (IST).", "सभी समय भारतीय मानक समय (IST) में हैं।")}</p>

            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Spinner className="w-8 h-8 text-purple-600" />
              </div>
            ) : timeSlotsForDate.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500 font-medium">{t("No slots available for this date.", "इस तारीख के लिए कोई स्लॉट उपलब्ध नहीं है।")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("Please select a different date.", "कृपया कोई अन्य तारीख चुनें।")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlotsForDate.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => { setSelectedTime(slot.time); setError(""); }}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all
                      ${selectedTime === slot.time
                        ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105"
                        : "bg-white text-gray-700 border-gray-200 hover:border-amber-400 hover:bg-amber-50"
                      }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary + Error */}
        {selectedDate && selectedTime && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 mb-4 flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <p className="text-sm font-bold text-purple-800">{t("Slot Selected", "स्लॉट चुना गया")}</p>
              <p className="text-sm text-purple-700">
                {fmtFull(selectedDate)} at <span className="font-bold">{selectedTime}</span>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="w-full py-4 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-base"
        >
          Continue to Checkout →
        </button>
      </div>
    </div>
  );
}

export default function BookSlotPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-10 h-10 text-purple-600" />
      </div>
    }>
      <BookSlotContent />
    </Suspense>
  );
}
