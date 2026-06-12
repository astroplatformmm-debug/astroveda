"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Review {
  _id: string;
  name: string;
  rating: number;
  message: string;
  profile_image?: string;
  featured?: boolean;
  created_at: string;
}

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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#FFF7ED] transition-colors">
        <span className="font-semibold text-sm text-[#0F172A]">{question}</span>
        <svg className={`w-4 h-4 text-[#F97316] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-4 bg-[#FFF7ED] text-sm text-[#475569] leading-relaxed border-t border-[#F97316]/20">{answer}</div>}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GemstoneDetail() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [gemstone, setGemstone] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<{ label: string; price: number } | null>(null);
  const [selectedRingMaterial, setSelectedRingMaterial] = useState<{ label: string; extraPrice: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const faqs = [
    { question: "What stones are in this bracelet?", answer: "The Dhan Yog Bracelet contains Yellow Citrine, Green Jade, Tiger's Eye, Hematite, and Moonstone — each selected according to Vedic astrology for wealth, career growth, and positive energy." },
    { question: "How is the bracelet energized?", answer: "Each bracelet is personally energized by Mukesh Ravindra Gupta using Vedic mantras aligned to current planetary positions. A small energization slip is included inside the box." },
    { question: "How do I know the gems are authentic?", answer: "Every bracelet comes with a lab certification card (AAA++ quality). You can verify authenticity using the unique code printed on the card." },
    { question: "How long does delivery take?", answer: "We dispatch within 24 hours of order. Standard delivery across India takes 3-7 business days. Insured shipping is provided for all orders." },
    { question: "What is your return policy?", answer: "If you receive a damaged or incorrect product, please contact us within 48 hours of delivery via WhatsApp or email. We will arrange a replacement or full refund." },
  ];

  const allImages = useMemo(() => {
    if (!gemstone) return [];
    const raw = [gemstone.image, ...(gemstone.images || [])].filter((src): src is string => typeof src === "string" && src.trim() !== "");
    return [...new Set(raw)];
  }, [gemstone]);

  useEffect(() => { setCurrentImageIndex(0); }, [gemstone?._id]);

  useEffect(() => {
    const fetchGemstone = async () => {
      const id = params?.id;
      if (!id) { setNotFound(true); setLoading(false); return; }
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Request failed: ${res.status}`); }
        const productData = (await res.json()) as Product;
        setGemstone(productData);
        // Meta Pixel - Track ViewContent event
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "ViewContent", {
            content_ids: [id],
            content_name: productData.title,
            content_type: "product",
            value: productData.price,
            currency: "INR",
          });
        }
      } catch (err) { console.error("Gemstone detail fetch failed:", err); setNotFound(true); }
      finally { setLoading(false); }
    };
    fetchGemstone();
  }, [params?.id]);

  const fetchReviews = async () => {
    try { setReviewsLoading(true); const res = await fetch("/api/reviews"); if (res.ok) setReviews(await res.json()); }
    catch { /* silent */ } finally { setReviewsLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleAddToCart = () => {
    if (!gemstone) return;
    addToCart({ id: gemstone._id || gemstone.id || "", title: gemstone.title, price: displayPrice, image: gemstone.image || "" });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex justify-center min-h-screen bg-[#FAF7F2] items-start pt-32"><Spinner className="w-10 h-10 text-[#F97316]" /></div>;
  if (notFound || !gemstone) return <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen bg-[#FAF7F2]"><p className="text-[#64748B] text-lg text-center pt-20">Gemstone not found.</p></div>;

  const productId = gemstone._id || gemstone.id || "";
  const categoryLabel = gemstone.category || "gemstones";
  const basePrice = selectedOption ? selectedOption.price : gemstone.price;
  const ringMaterialExtra = selectedRingMaterial ? selectedRingMaterial.extraPrice : 0;
  const displayPrice = basePrice + ringMaterialExtra;
  const mrp = gemstone.mrp ?? null;
  const discountPct = mrp && mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : null;
  const checkoutHref = `/checkout?productId=${productId}${selectedOption ? `&option=${encodeURIComponent(selectedOption.label)}&optionPrice=${selectedOption.price}` : ""}${selectedRingMaterial ? `&ringMaterial=${encodeURIComponent(selectedRingMaterial.label)}&ringMaterialExtraPrice=${selectedRingMaterial.extraPrice}` : ""}`;
  const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : null;
  const whatsappMessage = encodeURIComponent(`Hi, I am interested in the ${gemstone.title} (Rs.${displayPrice}). Can you help me?`);
  const whatsappUrl = `https://wa.me/917069110573?text=${whatsappMessage}`;

  const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-28 lg:pb-20" style={{ '--sticky-cta-height': '68px' } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 min-w-0">

        {/* Breadcrumb */}
        <Link href="/shop" className="inline-flex items-center text-sm font-bold text-[#64748B] hover:text-[#F97316] mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to all gemstones
        </Link>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

          {/* Images */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-xl border border-[#E2E8F0]">
              <img
                src={allImages[currentImageIndex] || gemstone.image || "https://picsum.photos/seed/default/600/400"}
                alt={gemstone.title}
                className="w-full h-auto max-h-[70vh] sm:max-h-none sm:h-96 min-h-[220px] object-cover max-w-full"
              />

              {/* 50% OFF badge on image — shows only when mrp is set */}
              {discountPct !== null && (
                <div className="absolute top-3 left-3 flex flex-col items-center justify-center bg-red-600 text-white rounded-xl px-3 py-1.5 shadow-lg leading-tight z-10">
                  <span className="text-xl font-extrabold leading-none">{discountPct}%</span>
                  <span className="text-xs font-bold tracking-widest uppercase">OFF</span>
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button type="button" onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors" aria-label="Previous image">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button type="button" onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors" aria-label="Next image">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mt-3">
                  {allImages.map((_, i) => (
                    <button key={i} type="button" onClick={() => setCurrentImageIndex(i)} className={`h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-[#F97316] w-4" : "bg-gray-300 w-2"}`} aria-label={`Go to image ${i + 1}`} />
                  ))}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {allImages.map((src, i) => (
                    <button key={src + i} type="button" onClick={() => setCurrentImageIndex(i)} className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex ? "border-[#F97316]" : "border-transparent"}`}>
                      <img src={src} alt="" className="w-16 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info panel */}
          <div>
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block bg-[#FFF7ED] text-[#F97316] text-xs px-3 py-1 rounded-full capitalize font-semibold">{categoryLabel}</span>
              {gemstone.certification && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-semibold border border-green-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {gemstone.certification} Certified
                </span>
              )}
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#0F172A] mt-3">{gemstone.title}</h1>

            {avgRating !== null && reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(avgRating)} size="sm" />
                <span className="text-sm font-semibold text-[#0F172A]">{avgRating}</span>
                <span className="text-sm text-[#64748B]">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </div>
            )}

            {/* Price row — MRP struck through + % OFF pill */}
            <div className="flex items-baseline gap-3 flex-wrap mt-3">
              <span className="text-3xl font-bold text-[#F97316]">&#8377;{displayPrice.toLocaleString("en-IN")}</span>
              {mrp && mrp > displayPrice && (
                <>
                  <span className="text-lg text-[#94A3B8] line-through font-medium">&#8377;{mrp.toLocaleString("en-IN")}</span>
                  {discountPct !== null && (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                      {discountPct}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {gemstone.zodiac && (
              <p className="text-sm text-[#64748B] mt-1"><span className="font-medium text-[#0F172A]">Zodiac:</span> {gemstone.zodiac}</p>
            )}

            {/* Benefits — dynamic per product, falls back to description if no benefits set */}
            {gemstone.benefits && gemstone.benefits.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Why this works</p>
                <div className="flex flex-col gap-3.5">
                  {gemstone.benefits.map((b) => (
                    <div key={b.label} className="flex items-start gap-3">
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
                <p className="text-sm text-[#475569] leading-relaxed">{gemstone.description}</p>
              </div>
            )}

            {/* Mini info cards */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: "💎", label: "Quality", value: "AAA++ Certified" },
                { icon: "⚡", label: "Energized", value: "Pre-charged" },
                { icon: "🚚", label: "Shipping", value: "Free & Fast" },
              ].map((c) => (
                <div key={c.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-xs text-[#94A3B8]">{c.icon} {c.label}</span>
                  <span className="text-xs font-bold text-[#0F172A]">{c.value}</span>
                </div>
              ))}
            </div>

            {/* Options */}
            {gemstone.options && gemstone.options.length > 0 && (
              <div className="mt-4">
                <label htmlFor="product-option" className="text-sm font-medium text-[#0F172A]">Select Option:</label>
                <select id="product-option" value={selectedOption ? selectedOption.label : ""} onChange={(e) => { const found = (gemstone.options || []).find((o) => o.label === e.target.value); setSelectedOption(found ?? null); }} className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#F97316]">
                  <option value="">Choose an option</option>
                  {gemstone.options!.map((opt) => (<option key={opt.label} value={opt.label}>{opt.label} — &#8377;{opt.price}</option>))}
                </select>
              </div>
            )}

            {/* Ring Material */}
            {gemstone.ringMaterialEnabled && gemstone.ringMaterials && gemstone.ringMaterials.length > 0 && (
              <div className="mt-4">
                <label htmlFor="ring-material" className="text-sm font-medium text-[#0F172A]">Ring Setting:</label>
                <select id="ring-material" value={selectedRingMaterial ? selectedRingMaterial.label : ""} onChange={(e) => { const found = (gemstone.ringMaterials || []).find((m) => m.label === e.target.value); setSelectedRingMaterial(found ?? null); }} className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#F97316]">
                  <option value="">No ring setting</option>
                  {gemstone.ringMaterials.map((mat) => (<option key={mat.label} value={mat.label}>{mat.label} {mat.extraPrice > 0 ? `(+&#8377;${mat.extraPrice})` : "(included)"}</option>))}
                </select>
                {selectedRingMaterial && selectedRingMaterial.extraPrice > 0 && (<p className="mt-1 text-xs text-[#64748B]">Ring setting adds &#8377;{selectedRingMaterial.extraPrice} to the price</p>)}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3">

              {/* ① Add to Cart — ABOVE Buy Now */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 border-2 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${cartAdded ? "border-green-500 bg-green-50 text-green-700" : "border-[#F97316] bg-white text-[#F97316] hover:bg-[#FFF7ED]"}`}
              >
                {cartAdded ? <><CheckIcon /> Added to Cart!</> : <><CartIcon /> Add to Cart</>}
              </button>

              {/* ② Buy Now */}
              <Link href={checkoutHref} className="block w-full bg-[#F97316] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#EA6C0A] transition-all duration-200 text-center shadow-md hover:shadow-lg">
                Buy Now
              </Link>

              {/* ③ WhatsApp */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full border-2 border-green-500 text-green-700 py-3.5 rounded-xl font-semibold text-base hover:bg-green-50 transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.523 5.86L.057 23.885a.5.5 0 00.611.611l6.115-1.526A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.815 9.815 0 01-4.992-1.364l-.358-.213-3.712.926.943-3.623-.234-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>
                Ask on WhatsApp before buying
              </a>

              <Link href="/shop" className="block text-center text-[#64748B] hover:text-[#F97316] text-sm">&#8592; Back to Shop</Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] grid grid-cols-3 gap-4">
              {[
                { bg: "bg-[#FFF7ED]", color: "text-[#F97316]", title: "Secure Payment", sub: "256-bit SSL encryption", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
                { bg: "bg-blue-50", color: "text-blue-600", title: "Fast Shipping", sub: "Insured, ships in 24h", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
                { bg: "bg-amber-50", color: "text-amber-600", title: "Lab Certified", sub: "AAA++ authentic gems", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /> },
              ].map((b) => (
                <div key={b.title} className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${b.bg} flex items-center justify-center ${b.color} flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{b.icon}</svg>
                  </div>
                  <div><h4 className="font-bold text-sm text-[#0F172A]">{b.title}</h4><p className="text-xs text-[#64748B]">{b.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About the Astrologer */}
        <div className="mt-16 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8">
          <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-5">About the Astrologer</h2>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-20 h-20 rounded-full bg-[#FFF7ED] border-4 border-[#F97316]/30 flex items-center justify-center flex-shrink-0">
              <span className="font-playfair font-bold text-[#F97316] text-xl">MRG</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0F172A]">Mukesh Ravindra Gupta</h3>
              <p className="text-[#F97316] text-sm font-semibold mb-3">Vedic Astrologer &middot; 25+ Years of Experience &middot; ISO 9001:2015 Certified</p>
              <p className="text-[#64748B] text-sm leading-relaxed">Each bracelet is personally selected and energized by Mukesh Ravindra Gupta using Vedic mantras aligned to current planetary positions. With over 5,000 clients guided across India, Mukesh ji brings deep expertise in Jyotish, gemstone therapy, and Kundli analysis. Every product is dispatched only after the complete energization ritual, ensuring the bracelet carries genuine positive vibrations for the wearer.</p>
            </div>
          </div>
        </div>

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
            <button onClick={() => setShowReviewForm((v) => !v)} className="flex items-center gap-2 bg-[#FFF7ED] hover:bg-[#FFE8D6] text-[#F97316] font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors border border-[#F97316]/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
                <svg className="w-7 h-7 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-[#0F172A] font-semibold mb-1">No reviews yet</p>
              <p className="text-[#64748B] text-sm">Be the first to share your experience!</p>
              <button onClick={() => setShowReviewForm(true)} className="mt-4 text-sm text-[#F97316] hover:text-[#EA6C0A] font-semibold transition-colors">Write a Review &#8594;</button>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="font-playfair text-2xl font-bold text-[#0F172A] mb-6">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>

      </div>

      {/* Mobile sticky CTA — Add to Cart + Buy Now */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E2E8F0] p-3 flex gap-2 lg:hidden shadow-2xl">
        <button type="button" onClick={handleAddToCart} className={`flex-1 flex items-center justify-center gap-1.5 border-2 py-3 rounded-xl font-semibold text-sm transition-all ${cartAdded ? "border-green-500 bg-green-50 text-green-700" : "border-[#F97316] text-[#F97316] bg-white"}`}>
          {cartAdded ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Added!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Add to Cart</>
          )}
        </button>
        <Link href={checkoutHref} className="flex-1 flex items-center justify-center bg-[#F97316] hover:bg-[#EA6C0A] text-white py-3 rounded-xl font-semibold text-sm transition-colors">
          Buy Now &#8377;{displayPrice.toLocaleString("en-IN")}
        </Link>
      </div>
    </div>
  );
}
