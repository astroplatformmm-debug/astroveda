"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
import { gemstones as mockGemstones } from "@/lib/mockData";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

// ─── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All Products", value: "all", icon: "✦" },
  { label: "Bracelets", value: "healing", icon: "📿" },
  { label: "Rudraksha", value: "rudraksha", icon: "🔮" },
  { label: "Gemstones", value: "gemstones", icon: "💎" },
  { label: "Yantras", value: "yantras", icon: "🔯" },
  { label: "Pooja Items", value: "pooja", icon: "🪔" },
];

const SORT_OPTIONS = [
  { label: "Default sorting", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
];

const BENEFITS = ["Protection", "Success", "Wealth", "Health", "Peace & Harmony"];

// ─── Product Card ────────────────────────────────────────────────────────────
function ShopCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const productId = product.slug || product._id || product.id || "";
  const mrp = product.mrp ?? null;
  const discountPct =
    mrp && mrp > product.price
      ? Math.round(((mrp - product.price) / mrp) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: productId, title: product.title, price: product.price, image: product.image || "" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE3] overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <Link href={`/shop/${productId}`} className="block">
        {/* Image */}
        <div className="relative h-52 bg-[#FAF7F2] overflow-hidden">
          <img
            src={product.image || "https://picsum.photos/seed/default/400/300"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discountPct !== null ? (
            <span className="absolute top-3 left-3 bg-[#F97316] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow">
              {discountPct}% OFF
            </span>
          ) : (
            <span className="absolute top-3 left-3 bg-[#22C55E] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              NEW
            </span>
          )}
          {/* Hover cart icon */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#F97316] hover:text-white text-[#F97316]"
          >
            {added ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-[#F97316] font-semibold uppercase tracking-wide mb-1 capitalize">
            {product.category || "gemstone"}
          </p>
          <h3 className="font-bold text-[#1A0A00] text-sm leading-snug mb-1 line-clamp-1">{product.title}</h3>
          <p className="text-xs text-[#94A3B8] line-clamp-1 mb-3">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-[#F97316] font-extrabold text-base">₹{product.price.toLocaleString("en-IN")}</span>
              {mrp && mrp > product.price && (
                <span className="text-xs text-[#CBD5E1] line-through">₹{mrp.toLocaleString("en-IN")}</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-[#F59E0B]">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${added ? "bg-green-500 text-white" : "bg-[#FFF3E8] text-[#F97316] hover:bg-[#F97316] hover:text-white border border-[#F97316]/20"}`}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── Trust bar ───────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div className="border-t border-[#F0EBE3] mt-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: "⚡", title: "Energised & Blessed", sub: "Personally energised and mantra charged" },
        { icon: "💎", title: "100% Authentic", sub: "Lab tested, certified and authentic products" },
        { icon: "📦", title: "Secure Packaging", sub: "Safe, insured & discreet worldwide shipping" },
        { icon: "🔄", title: "Easy Returns", sub: "Hassle-free 7-day returns" },
      ].map((i) => (
        <div key={i.title} className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF3E8] flex items-center justify-center text-lg flex-shrink-0">{i.icon}</div>
          <div>
            <p className="font-bold text-xs text-[#1A0A00]">{i.title}</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-tight">{i.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── NEW: search state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCategory = searchParams.get("category");
  const currentCategory = rawCategory?.trim() ? rawCategory.toLowerCase().trim() : "all";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const url = currentCategory !== "all"
          ? `/api/products?category=${encodeURIComponent(currentCategory)}`
          : "/api/products";
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        let payload: unknown;
        try { payload = JSON.parse(text); } catch {
          setError("Showing preview data.");
          setProducts(mockGemstones);
          return;
        }
        if (!res.ok || !Array.isArray(payload)) {
          setProducts(mockGemstones);
          return;
        }
        setProducts(payload as Product[]);
      } catch {
        setProducts(mockGemstones);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory]);

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.value === "all" ? products.length : products.filter((p) => p.category === cat.value).length,
  }));

  // ── NEW: search + filter + sort pipeline ───────────────────────────────────
  const displayed = [...products]
    .filter((p) => p.price <= maxPrice)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-extrabold text-[#1A0A00] uppercase tracking-widest mb-3">Categories</h3>
        <ul className="space-y-0.5">
          {categoryCounts.map((cat) => (
            <li key={cat.value}>
              <button
                onClick={() => { router.push(cat.value === "all" ? "/shop" : `/shop?category=${cat.value}`); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === cat.value ? "bg-[#FFF3E8] text-[#F97316] font-bold" : "text-[#475569] hover:bg-[#FAF7F2] hover:text-[#F97316]"}`}
              >
                <span>{cat.label}</span>
                <span className={`text-xs ${currentCategory === cat.value ? "text-[#F97316]" : "text-[#CBD5E1]"}`}>({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-extrabold text-[#1A0A00] uppercase tracking-widest mb-3">Price Range</h3>
        <input
          type="range" min={100} max={50000} step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#F97316] mb-2"
        />
        <div className="flex justify-between text-xs font-semibold text-[#64748B] mb-3">
          <span>₹100</span>
          <span>₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
        <button
          onClick={() => setMaxPrice(50000)}
          className="w-full py-2 bg-[#F97316] text-white text-xs font-bold rounded-lg hover:bg-[#EA6C0A] transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="text-xs font-extrabold text-[#1A0A00] uppercase tracking-widest mb-3">Benefits</h3>
        <ul className="space-y-2">
          {BENEFITS.map((b) => (
            <li key={b}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBenefits.includes(b)}
                  onChange={() => setSelectedBenefits((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])}
                  className="accent-[#F97316] w-3.5 h-3.5 rounded"
                />
                <span className="text-sm text-[#475569] group-hover:text-[#F97316] transition-colors">{b}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Header */}
      <div className="bg-white border-b border-[#F0EBE3] py-10 px-4 text-center">
        <p className="text-xs font-bold text-[#F97316] uppercase tracking-widest mb-2">✦ Vedic Gemstone Store ✦</p>
        <h1 className="font-playfair text-3xl md:text-5xl font-bold text-[#1A0A00] mb-3">
          Shop Our <span className="text-[#F97316]">Spiritual Essentials</span>
        </h1>
        <p className="text-[#64748B] text-sm max-w-lg mx-auto">
          Energised products crafted to bring positivity, protection and prosperity in your life.
        </p>

        {/* ── NEW: Search bar ───────────────────────────────────────────────── */}
        <div className="mt-6 max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAF7F2] text-sm text-[#1A0A00] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#F97316] transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category icon strip */}
      <div className="bg-white border-b border-[#F0EBE3] px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-start justify-center gap-5 sm:gap-8 flex-wrap">
          {categoryCounts.map((cat) => (
            <button
              key={cat.value}
              onClick={() => router.push(cat.value === "all" ? "/shop" : `/shop?category=${cat.value}`)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${currentCategory === cat.value ? "border-[#F97316] bg-[#FFF3E8] shadow-md scale-105" : "border-[#F0EBE3] bg-[#FAF7F2] group-hover:border-[#F97316] group-hover:bg-[#FFF3E8]"}`}>
                {cat.icon}
              </div>
              <span className={`text-[11px] font-semibold transition-colors text-center leading-tight ${currentCategory === cat.value ? "text-[#F97316]" : "text-[#64748B] group-hover:text-[#F97316]"}`}>
                {cat.label}
              </span>
              <span className="text-[10px] text-[#CBD5E1]">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#1A0A00]">Filters</h2>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-[#94A3B8] hover:text-[#1A0A00]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-[#F0EBE3] p-5 sticky top-24">
              <SidebarContent />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-sm text-[#64748B]">
                Showing <span className="font-bold text-[#1A0A00]">{displayed.length}</span> results
                {searchQuery && (
                  <span className="ml-1 text-[#F97316]">for &ldquo;{searchQuery}&rdquo;</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#475569] border border-[#E2E8F0] px-3 py-2 rounded-lg bg-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                  Filter
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white text-[#475569] focus:outline-none focus:border-[#F97316]"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-amber-600 text-sm mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">{error}</p>}

            {loading ? (
              <div className="flex justify-center py-24"><Spinner className="w-10 h-10 text-[#F97316]" /></div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#F0EBE3]">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-bold text-[#1A0A00] text-lg">No products found</p>
                <p className="text-[#64748B] text-sm mt-1">
                  {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters"}
                </p>
                <button
                  onClick={() => { router.push("/shop"); setMaxPrice(50000); setSearchQuery(""); }}
                  className="mt-4 px-6 py-2 bg-[#F97316] text-white rounded-full text-sm font-bold hover:bg-[#EA6C0A] transition-colors"
                >
                  View All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayed.map((p) => <ShopCard key={p._id || p.id} product={p} />)}
              </div>
            )}

            <TrustBar />
          </div>
        </div>
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
