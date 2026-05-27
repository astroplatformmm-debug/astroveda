"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import ServiceCard from "@/components/cards/ServiceCard";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from "@/lib/serviceCategory";

// ── Review types ──────────────────────────────────────────────────────────────
interface Review {
  _id: string;
  name: string;
  rating: number;
  message: string;
  profile_image?: string;
  featured?: boolean;
  created_at: string;
}

function ReviewAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-orange-500","bg-amber-500","bg-yellow-500","bg-purple-500","bg-indigo-500","bg-teal-500","bg-red-500"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  if (imageUrl) {
    return (
      <img src={imageUrl} alt={name}
        className="w-10 h-10 rounded-full object-cover border-2 border-[#F97316]/30"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
    </div>
  );
}

// ── Review components ─────────────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${cls} ${star <= rating ? "text-[#F59E0B]" : "text-[#E2E8F0]"}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-purple-500", "bg-teal-500"];
  const bgColor = colors[name.charCodeAt(0) % colors.length];
  const [imgFailed, setImgFailed] = useState(false);
  if (imageUrl && !imgFailed) {
    return <img src={imageUrl} alt={name} className="w-11 h-11 rounded-full object-cover border-2 border-[#F97316]/30 flex-shrink-0" onError={() => setImgFailed(true)} />;
  }
  return <div className={`w-11 h-11 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{initials}</div>;
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={review.name} imageUrl={review.profile_image} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-[#0F172A] text-sm">{review.name}</p>
            <span className="text-xs text-[#94A3B8]">{date}</span>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="text-[#475569] text-sm leading-relaxed">{review.message}</p>
      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        Verified Purchase
      </div>
    </div>
  );
}

function ReviewForm({ onSuccess }: { onSuccess: () => void }) {
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
    if (file.size > 2_000_000) { setError("Image must be smaller than 2 MB."); return; }
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => { const r = reader.result as string; setProfileImage(r); setPreviewUrl(r); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!name.trim() || name.trim().length < 2) { setError("Please enter your name (at least 2 characters)."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!message.trim() || message.trim().length < 10) { setError("Please write a review (at least 10 characters)."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, rating, message: message.trim(), profile_image: profileImage || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return; }
      setSuccess(true); onSuccess();
    } catch { setError("Network error. Please check your connection and try again."); } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF7ED] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold font-playfair text-[#0F172A] mb-2">Thank You! 🙏</h3>
        <p className="text-[#64748B] text-sm max-w-xs">Your review has been submitted and is awaiting admin approval. It will appear here soon.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-[#F97316] hover:text-[#EA6C0A] font-medium transition-colors">Write another review</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Your Name <span className="text-[#F97316]">*</span></label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" maxLength={100} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Email <span className="text-[#94A3B8] font-normal">(optional)</span></label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={200} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Rating <span className="text-[#F97316]">*</span></label>
        <div className="flex gap-1.5 items-center">
          {[1,2,3,4,5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none transition-transform hover:scale-110" aria-label={`Rate ${star} star${star>1?"s":""}`}>
              <svg className={`w-8 h-8 transition-colors ${star<=(hoverRating||rating)?"text-[#F59E0B]":"text-[#E2E8F0]"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-[#64748B] ml-1">{["","Poor","Fair","Good","Very Good","Excellent"][rating]}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Your Review <span className="text-[#F97316]">*</span></label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your experience with OMKKAAR Astroworld..." rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-white transition resize-none" />
        <p className="text-xs text-[#94A3B8] text-right mt-1">{message.length}/1000</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Profile Photo <span className="text-[#94A3B8] font-normal">(optional)</span></label>
        <div className="flex items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#F97316]" />
              <button type="button" onClick={() => { setProfileImage(null); setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ""; }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">x</button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FFF7ED] border-2 border-dashed border-[#F97316]/40 flex items-center justify-center text-[#F97316]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
          <label className="cursor-pointer">
            <span className="text-sm text-[#F97316] font-medium hover:text-[#EA6C0A] transition-colors">{previewUrl ? "Change photo" : "Upload photo"}</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}
      <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA6C0A] disabled:opacity-60 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
        {submitting ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>) : (<>Submit Review</>)}
      </button>
    </form>
  );
}

// ── Related Services Section ──────────────────────────────────────────────────
function RelatedServices({ currentId }: { currentId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data.filter((s: Service) => s._id !== currentId).slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentId]);

  if (loading || services.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-bold text-[#0F172A]">Explore More Services</h2>
        <Link href="/services" className="text-sm text-[#F97316] font-semibold hover:underline">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <ServiceCard key={s._id} service={s} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#FFF7ED] transition-colors"
      >
        <span className="font-semibold text-sm text-[#0F172A]">{question}</span>
        <svg
          className={`w-4 h-4 text-[#F97316] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 bg-[#FFF7ED] text-sm text-[#475569] leading-relaxed border-t border-[#F97316]/20">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function ServiceDetail() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Build image gallery from bannerImage + image fields
  const allImages: string[] = service
    ? [service.bannerImage, service.image]
        .filter((src): src is string => typeof src === "string" && src.trim() !== "")
        .filter((v, i, a) => a.indexOf(v) === i)
    : [];

  // ── Fetch reviews ─────────────────────────────────────────────────────────
  const fetchReviews = useCallback(() => {
    setReviewsLoading(true);
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReviews(data); })
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Computed average rating ───────────────────────────────────────────────
  const avgRating: number | null =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  // ── Fetch service ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchService = async () => {
      const id = params?.id;
      if (!id) { setNotFound(true); setLoading(false); return; }
      try {
        const res = await fetch(`/api/services/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as Service;
        setService(data);
        // Meta Pixel — ViewContent event
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "ViewContent", {
            content_ids: [id],
            content_name: data.title,
            content_type: "product",
            value: data.price,
            currency: "INR",
          });
        }
      } catch (err: unknown) {
        console.error("Service detail fetch failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params?.id]);

  const handleCta = () => {
    if (!service) return;
    if (service.ctaLink) {
      if (service.ctaLink.startsWith("http")) { window.location.href = service.ctaLink; return; }
      router.push(service.ctaLink);
      return;
    }
    const p = new URLSearchParams({
      serviceId: service._id || "",
      title: service.title,
      price: String(service.price),
    });
    router.push(`/book-slot?${p.toString()}`);
    // Meta Pixel — InitiateCheckout event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        content_ids: [service._id],
        content_name: service.title,
        value: service.price,
        currency: "INR",
      });
    }
  };

  const consultNow = () => router.push("/contact");

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex justify-center min-h-screen bg-[#FAF7F2] items-start pt-32">
      <Spinner className="w-10 h-10 text-[#F97316]" />
    </div>
  );

  if (notFound || !service) return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 text-center min-h-screen bg-[#FAF7F2]">
      <div className="text-6xl mb-4">🔮</div>
      <h1 className="font-playfair text-3xl font-bold text-[#0F172A] mb-3">Service Not Found</h1>
      <p className="text-[#64748B] mb-6">This service doesn&apos;t exist or may have been removed.</p>
      <Link href="/services" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors">
        ← Back to Services
      </Link>
    </div>
  );

  const category = (service.category || "astrology").toLowerCase() as keyof typeof SERVICE_CATEGORY_LABELS;
  const catIcon = SERVICE_CATEGORY_ICONS[category] ?? "🔮";
  const catLabel = SERVICE_CATEGORY_LABELS[category] ?? service.category ?? "Astrology";
  const whatsappMessage = encodeURIComponent(`Hi, I am interested in the ${service.title} (₹${service.price}). Can you help me?`);
  const whatsappUrl = `https://wa.me/917069110573?text=${whatsappMessage}`;

  return (
    // FIX: CSS variable tells WhatsAppButton.tsx to float above the mobile sticky CTA bar
    <div className="bg-[#FAF7F2] min-h-screen pb-28 lg:pb-16" style={{ "--sticky-cta-height": "68px" } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64748B] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[#F97316] transition-colors">Services</Link>
          {service.category && (
            <>
              <span>/</span>
              <Link href={`/services?category=${service.category}`} className="hover:text-[#F97316] transition-colors capitalize">
                {catLabel}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{service.title}</span>
        </nav>

        {/* ── PRODUCT-STYLE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

          {/* LEFT — Image gallery */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-xl border border-[#E2E8F0] aspect-square sm:aspect-auto sm:h-96 flex items-center justify-center">
              {allImages.length > 0 ? (
                <img
                  src={allImages[currentImageIndex]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
                  <span className="text-8xl">{catIcon}</span>
                  <p className="text-white/50 text-sm">No image available</p>
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {allImages.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setCurrentImageIndex(i)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex ? "border-[#F97316]" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="w-16 h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Astrologer card below image */}
            <div className="mt-4 bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
              <img
                src="/astrologer.png"
                alt="Mukesh Ravindra Gupta"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#F97316]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div>
                <p className="font-bold text-[#0F172A] text-sm">Mukesh Ravindra Gupta</p>
                <p className="text-xs text-[#F97316]">Certified Vedic Astrologer</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {"⭐⭐⭐⭐⭐".split("").map((s, i) => <span key={i} className="text-[10px]">{s}</span>)}
                  <span className="text-[10px] text-[#64748B] ml-1">5.0 (12k+ clients)</span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">25+ years · ISO 9001:2015 Certified</p>
              </div>
            </div>
          </div>

          {/* RIGHT — Info panel */}
          <div>
            {/* Category tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[#FFF7ED] text-[#F97316] text-xs px-3 py-1 rounded-full font-semibold">
                {catIcon} {catLabel}
              </span>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-semibold border border-green-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ISO Certified
              </span>
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#0F172A] mt-3 leading-tight">
              {service.title}
            </h1>

            {service.shortDescription && (
              <p className="text-[#64748B] mt-2 text-sm leading-relaxed">{service.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-[#F97316]">₹{service.price?.toLocaleString("en-IN")}</span>
              {service.duration && (
                <span className="text-sm text-[#64748B] flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  {service.duration} session
                </span>
              )}
            </div>

            {/* Benefits / Description */}
            {service.benefits && service.benefits.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-3">What you get</p>
                <div className="flex flex-col gap-3">
                  {service.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{b.label}</p>
                        {b.desc && <p className="text-xs text-[#64748B] mt-0.5">{b.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <p className="text-sm text-[#475569] leading-relaxed">{service.description}</p>
              </div>
            )}

            {/* Mini trust cards */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: "🔒", label: "Private", value: "100% Confidential" },
                { icon: "💎", label: "Gemstones", value: "Personalised Pick" },
                { icon: "⚡", label: "Response", value: "Within 24 hrs" },
                { icon: "🏆", label: "Certified", value: "ISO 9001:2015" },
              ].map((c) => (
                <div key={c.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-xs text-[#94A3B8]">{c.icon} {c.label}</span>
                  <span className="text-xs font-bold text-[#0F172A]">{c.value}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCta}
                className="w-full py-4 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-base"
              >
                {service.ctaText || "Book Now"} →
              </button>

              <button
                type="button"
                onClick={consultNow}
                className="w-full py-4 border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white font-bold rounded-xl transition-all duration-200 text-base"
              >
                Talk to Astrologer
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border-2 border-green-500 text-green-700 py-3.5 rounded-xl font-semibold text-base hover:bg-green-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#16a34a">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.523 5.86L.057 23.885a.5.5 0 00.611.611l6.115-1.526A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.815 9.815 0 01-4.992-1.364l-.358-.213-3.712.926.943-3.623-.234-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                </svg>
                Ask on WhatsApp before booking
              </a>

              <Link href="/services" className="block text-center text-[#64748B] hover:text-[#F97316] text-sm transition-colors">
                ← Back to all Services
              </Link>
            </div>

            {/* Trust badges row */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
              {[
                { bg: "bg-[#FFF7ED]", color: "text-[#F97316]", title: "Secure & Private", sub: "100% confidential", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { bg: "bg-blue-50", color: "text-blue-600", title: "Expert Guidance", sub: "25+ yrs experience", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { bg: "bg-purple-50", color: "text-purple-600", title: "Gemstone Guidance", sub: "Vedic recommendations", path: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" },
                { bg: "bg-amber-50", color: "text-amber-600", title: "ISO Certified", sub: "9001:2015 standard", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
              ].map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${b.bg} flex items-center justify-center ${b.color} flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.path} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">{b.title}</h4>
                    <p className="text-xs text-[#64748B]">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FULL-WIDTH SECTIONS BELOW ── */}

        {/* About / Description */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
          <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-4">About This Service</h2>
          <div className="prose prose-orange max-w-none text-[#374151] leading-relaxed whitespace-pre-line">
            {service.description}
          </div>
        </div>

        {/* Key Points / What's Included */}
        {service.keyPoints && service.keyPoints.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
            <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">What&apos;s Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[#FFF7ED] rounded-xl border border-[#FED7AA]">
                  <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{kp.label}</p>
                    {kp.desc && <p className="text-sm text-[#64748B] mt-0.5">{kp.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gemstone Recommendations */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 sm:px-8 py-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">💎</span>
              <h2 className="font-playfair text-2xl font-bold text-white">Gemstone Recommendations</h2>
            </div>
            <p className="text-purple-100 text-sm ml-11">Vedic astrology prescribes specific gemstones to strengthen planetary energies in your Kundli</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { planet: "Sun (Surya)", stone: "Ruby", hindi: "Manik", color: "#DC2626", bg: "bg-red-50", border: "border-red-200", gem: "🔴", finger: "Ring finger", metal: "Gold", day: "Sunday", benefits: ["Leadership & authority", "Self-confidence", "Career growth"] },
                { planet: "Moon (Chandra)", stone: "Pearl", hindi: "Moti", color: "#6B7280", bg: "bg-gray-50", border: "border-gray-200", gem: "⚪", finger: "Little finger", metal: "Silver", day: "Monday", benefits: ["Mental peace", "Emotional balance", "Intuition"] },
                { planet: "Mars (Mangal)", stone: "Red Coral", hindi: "Moonga", color: "#EA580C", bg: "bg-orange-50", border: "border-orange-200", gem: "🟠", finger: "Ring finger", metal: "Gold / Copper", day: "Tuesday", benefits: ["Courage & energy", "Health & vitality", "Removes obstacles"] },
                { planet: "Mercury (Budh)", stone: "Emerald", hindi: "Panna", color: "#16A34A", bg: "bg-green-50", border: "border-green-200", gem: "💚", finger: "Little finger", metal: "Gold / Silver", day: "Wednesday", benefits: ["Intelligence & memory", "Business success", "Communication"] },
                { planet: "Jupiter (Guru)", stone: "Yellow Sapphire", hindi: "Pukhraj", color: "#CA8A04", bg: "bg-yellow-50", border: "border-yellow-200", gem: "💛", finger: "Index finger", metal: "Gold", day: "Thursday", benefits: ["Wisdom & knowledge", "Wealth & prosperity", "Marriage luck"] },
                { planet: "Venus (Shukra)", stone: "Diamond", hindi: "Heera", color: "#7C3AED", bg: "bg-violet-50", border: "border-violet-200", gem: "💜", finger: "Middle finger", metal: "Gold / Platinum", day: "Friday", benefits: ["Love & relationships", "Luxury & comfort", "Artistic talent"] },
                { planet: "Saturn (Shani)", stone: "Blue Sapphire", hindi: "Neelam", color: "#1D4ED8", bg: "bg-blue-50", border: "border-blue-200", gem: "💙", finger: "Middle finger", metal: "Gold / Silver", day: "Saturday", benefits: ["Discipline & focus", "Career stability", "Removes delays"] },
                { planet: "Rahu (North Node)", stone: "Hessonite", hindi: "Gomed", color: "#92400E", bg: "bg-amber-50", border: "border-amber-200", gem: "🟤", finger: "Middle finger", metal: "Silver / Panchdhatu", day: "Saturday", benefits: ["Ambition & success", "Removes confusion", "Foreign gains"] },
                { planet: "Ketu (South Node)", stone: "Cat's Eye", hindi: "Lehsunia", color: "#065F46", bg: "bg-emerald-50", border: "border-emerald-200", gem: "🟢", finger: "Little finger", metal: "Silver / Panchdhatu", day: "Tuesday", benefits: ["Spiritual growth", "Moksha & liberation", "Psychic insight"] },
              ].map((g) => (
                <div key={g.planet} className={`rounded-xl border ${g.border} ${g.bg} p-4 flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{g.planet}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg">{g.gem}</span>
                        <div>
                          <p className="font-bold text-[#0F172A] text-base leading-tight">{g.stone}</p>
                          <p className="text-xs text-[#94A3B8]">{g.hindi}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[{ label: "Finger", val: g.finger }, { label: "Metal", val: g.metal }, { label: "Day", val: g.day }].map((d) => (
                      <span key={d.label} className="text-xs bg-white/70 border border-white rounded-full px-2 py-0.5 text-[#475569]">
                        <span className="text-[#94A3B8]">{d.label}: </span>{d.val}
                      </span>
                    ))}
                  </div>
                  <ul className="flex flex-col gap-1">
                    {g.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-1.5 text-xs text-[#374151]">
                        <span style={{ color: g.color }} className="text-[10px]">✦</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <span className="text-xl shrink-0">⚠️</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Important:</span> Gemstone recommendations are highly personal and depend on your Kundli&apos;s planetary positions, Dasha, and Lagna. Always consult our astrologer before wearing any gemstone — the wrong stone can have adverse effects.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        {service.faq && service.faq.length > 0 && (
          <div className="mt-8">
            <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-3">
              {service.faq.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="mt-12">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-[#0F172A]">Customer Reviews</h2>
              {avgRating !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Math.round(avgRating)} size="lg" />
                  <span className="font-bold text-[#0F172A]">{avgRating} / 5</span>
                  <span className="text-[#64748B] text-sm">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReviewForm((v) => !v)}
              className="flex items-center gap-2 bg-[#FFF7ED] hover:bg-[#FFE8D6] text-[#F97316] font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors border border-[#F97316]/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-8">
              <h3 className="font-playfair text-xl font-bold text-[#0F172A] mb-5">Share Your Experience</h3>
              <ReviewForm onSuccess={() => { fetchReviews(); setShowReviewForm(false); }} />
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-10"><Spinner className="w-8 h-8 text-[#F97316]" /></div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF7ED] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[#0F172A] font-semibold mb-1">No reviews yet</p>
              <p className="text-[#64748B] text-sm">Be the first to share your experience!</p>
              <button onClick={() => setShowReviewForm(true)} className="mt-4 text-sm text-[#F97316] hover:text-[#EA6C0A] font-semibold transition-colors">Write a Review &#8594;</button>
            </div>
          )}
        </div>

        {/* Explore more CTA */}
        <div className="mt-12 bg-[#0F172A] rounded-2xl py-10 px-6 text-center">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Explore More Services</h3>
          <p className="text-white/60 mb-6">Discover our full range of Vedic consultations and remedies.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/services" className="px-6 py-2.5 bg-[#F97316] text-white rounded-full font-semibold hover:bg-[#EA6C0A] transition-colors">
              All Services
            </Link>
            <Link href="/contact" className="px-6 py-2.5 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E2E8F0] p-3 flex gap-2 lg:hidden shadow-2xl">
        <button
          type="button"
          onClick={consultNow}
          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-[#0F172A] text-[#0F172A] py-3 rounded-xl font-semibold text-sm transition-all hover:bg-[#0F172A] hover:text-white"
        >
          Talk to Astrologer
        </button>
        <button
          type="button"
          onClick={handleCta}
          className="flex-1 flex items-center justify-center bg-[#F97316] hover:bg-[#EA6C0A] text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {service.ctaText || "Book Now"} ₹{service.price?.toLocaleString("en-IN")}
        </button>
      </div>
    </div>
  );
}
