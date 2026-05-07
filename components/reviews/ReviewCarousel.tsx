"use client";

import { useState, useEffect, useCallback } from "react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  message: string;
  profile_image?: string;
  featured?: boolean;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-[#F59E0B]" : "text-[#E2E8F0]"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color from name
  const colors = [
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const colorIndex =
    name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#F97316]/30"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm`}
    >
      {initials}
    </div>
  );
}

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (isAnimating || reviews.length === 0) return;
      setIsAnimating(true);
      setDirection(dir);
      setTimeout(() => {
        setCurrentIndex(
          ((index % reviews.length) + reviews.length) % reviews.length
        );
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating, reviews.length]
  );

  const goNext = useCallback(
    () => goTo(currentIndex + 1, "next"),
    [currentIndex, goTo]
  );
  const goPrev = useCallback(
    () => goTo(currentIndex - 1, "prev"),
    [currentIndex, goTo]
  );

  // Auto-advance
  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, reviews.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin w-8 h-8 text-[#F97316]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-[#94A3B8]">Loading reviews…</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <svg
          className="w-12 h-12 text-[#E2E8F0] mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-[#94A3B8] text-sm">
          No reviews yet — be the first!
        </p>
      </div>
    );
  }

  const review = reviews[currentIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Review Card */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            isAnimating
              ? direction === "next"
                ? "-translate-x-4 opacity-0"
                : "translate-x-4 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {/* Quote icon */}
          <div className="text-[#F97316]/20 mb-3">
            <svg
              className="w-10 h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Stars */}
          <StarRating rating={review.rating} />

          {/* Message */}
          <p className="mt-3 text-[#334155] text-sm leading-relaxed line-clamp-5">
            {review.message}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 mt-5">
            <div className="relative">
              <Avatar name={review.name} imageUrl={review.profile_image} />
              {/* Fallback avatar for broken images */}
              <div
                className={`w-12 h-12 rounded-full bg-orange-500 hidden items-center justify-center text-white font-bold text-sm absolute inset-0`}
              >
                {review.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#0F172A] text-sm">
                {review.name}
                {review.featured && (
                  <span className="ml-2 text-[10px] text-[#F97316] font-bold uppercase tracking-wider">
                    ★ Featured
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[#64748B]">Verified Client</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F1F5F9]">
          {/* Dots */}
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  goTo(i, i > currentIndex ? "next" : "prev")
                }
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-5 h-2 bg-[#F97316]"
                    : "w-2 h-2 bg-[#E2E8F0] hover:bg-[#CBD5E1]"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
              aria-label="Previous review"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
              aria-label="Next review"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Counter */}
      {reviews.length > 1 && (
        <p className="text-center text-xs text-[#94A3B8] mt-2">
          {currentIndex + 1} / {reviews.length} reviews
        </p>
      )}
    </div>
  );
}
