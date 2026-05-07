"use client";

import { useState, useRef } from "react";

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2_000_000) {
      setError("Image must be smaller than 2 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setProfileImage(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError("Please write a review (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          rating,
          message: message.trim(),
          profile_image: profileImage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      // Reset
      setName("");
      setEmail("");
      setRating(0);
      setMessage("");
      setProfileImage(null);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF7ED] flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#F97316]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold font-playfair text-[#0F172A] mb-2">
          Thank You! 🙏
        </h3>
        <p className="text-[#64748B] text-sm max-w-xs">
          Your review has been submitted and is awaiting admin approval. It will
          appear here soon.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm text-[#F97316] hover:text-[#EA6C0A] font-medium transition-colors"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Your Name <span className="text-[#F97316]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Email{" "}
          <span className="text-[#94A3B8] font-normal">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition"
        />
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Rating <span className="text-[#F97316]">*</span>
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-[#F59E0B]"
                    : "text-[#E2E8F0]"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-[#64748B] self-center ml-1">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Your Review <span className="text-[#F97316]">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience with OMKKAAR Astroworld..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition resize-none"
        />
        <p className="text-xs text-[#94A3B8] text-right mt-1">
          {message.length}/1000
        </p>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
          Profile Photo{" "}
          <span className="text-[#94A3B8] font-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#F97316]"
              />
              <button
                type="button"
                onClick={() => {
                  setProfileImage(null);
                  setPreviewUrl(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FFF7ED] border-2 border-dashed border-[#F97316]/40 flex items-center justify-center text-[#F97316]">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
          <label className="cursor-pointer">
            <span className="text-sm text-[#F97316] font-medium hover:text-[#EA6C0A] transition-colors">
              {previewUrl ? "Change photo" : "Upload photo"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA6C0A] disabled:opacity-60 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
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
            Submitting…
          </>
        ) : (
          <>
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}
