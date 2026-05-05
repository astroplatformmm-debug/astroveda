"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

type ProductCardData = Product & { id?: string };

export default function GemstoneCard({ product }: { product: ProductCardData }) {
  const router = useRouter();
  const productId = product._id || product.id;

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-all duration-200 border border-[#E2E8F0] flex flex-col h-full group">
      <Link
        href={`/products/${productId}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`View ${product.title}`}
      />
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
          {product.zodiac && (
            <span className="absolute top-3 left-3 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full z-20 uppercase tracking-wide">
              {product.zodiac}
            </span>
          )}
          <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-sm animate-pulse">
            Limited Stock
          </span>
          <img
            src={product.image || "https://picsum.photos/seed/default/600/400"}
            alt={product.title}
            className="w-full h-full max-w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h3 className="font-playfair text-lg font-bold text-[#0F172A] leading-tight">{product.title}</h3>
            <span className="text-[#F97316] font-bold text-lg whitespace-nowrap">₹{product.price}</span>
          </div>

          <ul className="text-sm text-[#64748B] mb-5 flex-grow space-y-1">
            <li className="flex items-start">
              <span className="text-[#F97316] mr-2">•</span>
              <span>{product.description}</span>
            </li>
          </ul>

          <div className="mt-auto pt-4 border-t border-[#E2E8F0] space-y-4 pointer-events-auto">
            <div className="flex flex-col gap-1 text-xs text-[#64748B]">
              {product.zodiac && (
                <div>
                  <span className="font-semibold text-[#0F172A]">Zodiac:</span> {product.zodiac}
                </div>
              )}
              {product.certification && (
                <div>
                  <span className="font-semibold text-[#0F172A]">Certification:</span> {product.certification}
                </div>
              )}
            </div>

            <button
              type="button"
              className="relative z-20 w-full block text-center py-2.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/checkout?productId=${productId}`);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
