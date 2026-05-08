"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
import { useParams } from "next/navigation";

export default function GemstoneDetail() {
  const params = useParams<{ id: string }>();
  const [gemstone, setGemstone] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<{ label: string; price: number } | null>(null);
  const [selectedRingMaterial, setSelectedRingMaterial] = useState<{ label: string; extraPrice: number } | null>(null);

  const extractErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      return body.error || `Request failed: ${response.status}`;
    } catch {
      return `Request failed: ${response.status}`;
    }
  };

  const allImages = useMemo(() => {
    if (!gemstone) return [];
    const raw = [gemstone.image, ...(gemstone.images || [])].filter(
      (src): src is string => typeof src === "string" && src.trim() !== "",
    );
    return [...new Set(raw)];
  }, [gemstone]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [gemstone?._id]);

  useEffect(() => {
    const fetchGemstone = async () => {
      const id = params?.id;
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error(await extractErrorMessage(res));
        }
        const data = (await res.json()) as Product;
        setGemstone(data);
      } catch (err: unknown) {
        console.error("Gemstone detail fetch failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGemstone();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex justify-center min-h-screen bg-[#FAF7F2] items-start pt-32">
        <Spinner className="w-10 h-10 text-[#F97316]" />
      </div>
    );
  }

  if (notFound || !gemstone) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen bg-[#FAF7F2]">
        <p className="text-[#64748B] text-lg text-center pt-20">Gemstone not found.</p>
      </div>
    );
  }

  const productId = gemstone._id || gemstone.id || "";
  const categoryLabel = gemstone.category || "gemstones";
  const basePrice = selectedOption ? selectedOption.price : gemstone.price;
  const ringMaterialExtra = selectedRingMaterial ? selectedRingMaterial.extraPrice : 0;
  const displayPrice = basePrice + ringMaterialExtra;
  const checkoutHref = `/checkout?productId=${productId}${selectedOption ? `&option=${encodeURIComponent(selectedOption.label)}&optionPrice=${selectedOption.price}` : ""}${selectedRingMaterial ? `&ringMaterial=${encodeURIComponent(selectedRingMaterial.label)}&ringMaterialExtraPrice=${selectedRingMaterial.extraPrice}` : ""}`;

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 min-w-0">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm font-bold text-[#64748B] hover:text-[#F97316] mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all gemstones
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-xl border border-[#E2E8F0]">
              <img
                src={allImages[currentImageIndex] || gemstone.image || "https://picsum.photos/seed/default/600/400"}
                alt={gemstone.title}
                className="w-full h-auto max-h-[70vh] sm:max-h-none sm:h-96 min-h-[220px] object-cover max-w-full"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-[#0F172A] hover:text-[#F97316] transition-colors"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mt-3">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentImageIndex ? "bg-[#F97316] w-4" : "bg-gray-300 w-2"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {allImages.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        i === currentImageIndex ? "border-[#F97316]" : "border-transparent"
                      }`}
                    >
                      <img src={src} alt="" className="w-16 h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <span className="inline-block bg-[#FFF7ED] text-[#F97316] text-xs px-3 py-1 rounded-full capitalize">
              {categoryLabel}
            </span>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#0F172A] mt-3">{gemstone.title}</h1>
            <p className="text-3xl font-bold text-[#F97316] mt-2">₹{displayPrice}</p>

            {gemstone.zodiac && <p className="text-sm text-[#64748B] mt-1">Zodiac: {gemstone.zodiac}</p>}
            {gemstone.certification && (
              <p className="text-sm text-[#64748B]">Certification: {gemstone.certification}</p>
            )}

            <p className="text-[#64748B] mt-4 leading-relaxed">{gemstone.description}</p>

            {gemstone.options && gemstone.options.length > 0 && (
              <div className="mt-4">
                <label htmlFor="product-option" className="text-sm font-medium text-[#0F172A]">
                  Select Option:
                </label>
                <select
                  id="product-option"
                  value={selectedOption ? selectedOption.label : ""}
                  onChange={(e) => {
                    const found = (gemstone.options || []).find((o) => o.label === e.target.value);
                    setSelectedOption(found ?? null);
                  }}
                  className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#F97316]"
                >
                  <option value="">Choose an option</option>
                  {gemstone.options!.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} — ₹{opt.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {gemstone.ringMaterialEnabled && gemstone.ringMaterials && gemstone.ringMaterials.length > 0 && (
              <div className="mt-4">
                <label htmlFor="ring-material" className="text-sm font-medium text-[#0F172A]">
                  Ring Setting:
                </label>
                <select
                  id="ring-material"
                  value={selectedRingMaterial ? selectedRingMaterial.label : ""}
                  onChange={(e) => {
                    const found = (gemstone.ringMaterials || []).find((m) => m.label === e.target.value);
                    setSelectedRingMaterial(found ?? null);
                  }}
                  className="mt-1 w-full border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#F97316]"
                >
                  <option value="">No ring setting</option>
                  {gemstone.ringMaterials.map((mat) => (
                    <option key={mat.label} value={mat.label}>
                      {mat.label} {mat.extraPrice > 0 ? `(+₹${mat.extraPrice})` : "(included)"}
                    </option>
                  ))}
                </select>
                {selectedRingMaterial && selectedRingMaterial.extraPrice > 0 && (
                  <p className="mt-1 text-xs text-[#64748B]">
                    Ring setting adds ₹{selectedRingMaterial.extraPrice} to the price
                  </p>
                )}
              </div>
            )}

            <Link
              href={checkoutHref}
              className="block mt-6 w-full bg-[#F97316] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#EA6C0A] transition-all duration-200 text-center"
            >
              Buy Now
            </Link>

            <Link
              href="/shop"
              className="block text-center mt-3 text-[#64748B] hover:text-[#F97316] text-sm"
            >
              ← Back to Shop
            </Link>

            <div className="mt-12 pt-8 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">Secure Payment</h4>
                  <p className="text-xs text-[#64748B] font-medium">256-bit SSL</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">Fast Shipping</h4>
                  <p className="text-xs text-[#64748B] font-medium">Insured Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
