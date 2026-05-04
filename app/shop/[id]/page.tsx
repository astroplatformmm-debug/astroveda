"use client";

import { useEffect, useState } from "react";
import GemstoneCard from "@/components/cards/GemstoneCard";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
import { gemstones as mockGemstones } from "@/lib/mockData";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ShopContent() {
  const [gemstones, setGemstones] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCategory = searchParams.get("category");
  const currentCategory =
    rawCategory && rawCategory.trim() !== "" ? rawCategory.toLowerCase().trim() : "all";

  useEffect(() => {
    const fetchGemstones = async () => {
      try {
        setLoading(true);
        setError("");
        const url =
          currentCategory && currentCategory !== "all"
            ? `/api/products?category=${encodeURIComponent(currentCategory)}`
            : "/api/products";
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        let payload: unknown;
        try {
          payload = JSON.parse(text) as unknown;
        } catch {
          console.error("Products fetch failed: non-JSON response", text.slice(0, 160));
          setError("Unable to load live gemstones right now, showing preview.");
          setGemstones(mockGemstones);
          return;
        }
        if (!res.ok) {
          const msg =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof (payload as { error: unknown }).error === "string"
              ? (payload as { error: string }).error
              : `Request failed: ${res.status}`;
          console.error("Products fetch failed:", msg);
          setError(msg || "Unable to load live gemstones right now, showing preview.");
          setGemstones(mockGemstones);
          return;
        }
        if (!Array.isArray(payload)) {
          setError("Unexpected response from server.");
          setGemstones(mockGemstones);
          return;
        }
        const data = payload as Product[];
        setGemstones(data);
      } catch (err: unknown) {
        console.error("Products fetch failed:", err);
        setError("Unable to load live gemstones right now, showing preview.");
        setGemstones(mockGemstones);
      } finally {
        setLoading(false);
      }
    };

    fetchGemstones();
  }, [currentCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] pb-16">
      {/* Header Banner */}
      <div className="bg-[#F97316] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto text-center min-w-0">
          <h1 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold mb-4 px-1">Our Gemstone Collection</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">
            Authentic, lab-certified gemstones carefully selected to balance your planetary alignments and bring prosperity.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-2 mb-8">
          {[
            { label: "All Products", value: "all" },
            { label: "Healing Crystals", value: "healing" },
            { label: "Gemstones", value: "gemstones" },
            { label: "Rudraksha", value: "rudraksha" },
            { label: "Pooja Items", value: "pooja" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                if (cat.value === "all") {
                  router.push("/shop");
                } else {
                  router.push(`/shop?category=${encodeURIComponent(cat.value)}`);
                }
              }}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold transition-all duration-200 border-2 text-sm sm:text-base ${currentCategory === cat.value ? 'bg-[#F97316] text-white border-[#F97316] shadow-md' : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#F97316] hover:bg-[#FFF7ED]'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10 w-full min-w-0">
        {loading ? (
          <div className="flex justify-center py-16 bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
            <Spinner className="w-10 h-10 text-[#F97316]" />
          </div>
        ) : (
          <>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {gemstones.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-xl font-medium text-[#0F172A]">No products in this category yet</p>
                  <p className="text-[#64748B] mt-2">Check back soon or browse all products</p>
                  <button
                    type="button"
                    onClick={() => router.push("/shop")}
                    className="mt-4 px-6 py-2 bg-[#F97316] text-white rounded-full hover:bg-[#EA6C0A] transition-all"
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                gemstones.map((gem) => <GemstoneCard key={gem._id || gem.id} product={gem} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="w-10 h-10 text-[#F97316]" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
