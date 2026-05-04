"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { gemstones } from "@/lib/mockData";
import type { Product, Service } from "@/lib/types";

/* ---------------- Testimonials ---------------- */
const testimonials = [
  {
    name: "Priya Sharma",
    rating: 5,
    review:
      "Mukesh ji's guidance completely changed my perspective. His Kundli reading was incredibly accurate and the remedies he suggested worked wonders for my career.",
    initial: "P",
  },
  {
    name: "Rajesh Kumar",
    rating: 5,
    review:
      "Excellent consultation! The gemstone recommendation was spot on. I can feel the positive energy.",
    initial: "R",
  },
  {
    name: "Sunita Verma",
    rating: 5,
    review:
      "Predictions were amazingly accurate. Thank you Mukesh ji!",
    initial: "S",
  },
];

function TestimonialsCarousel() {
  const [start, setStart] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStart((s) => (s >= testimonials.length - 1 ? 0 : s + 1));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[start];

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="text-orange-500 mb-2">{"⭐".repeat(t.rating)}</div>
        <p className="italic mb-4">"{t.review}"</p>
        <h4 className="font-bold">{t.name}</h4>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Hero */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl font-bold mb-4">
          TALK TO <span className="text-orange-500">EXPERT ASTROLOGER</span>
        </h1>
        <p className="mb-6 text-gray-600">
          Get your personalized Kundli & consultation
        </p>
        <Link href="/services">
          <button className="px-6 py-3 bg-orange-500 text-white rounded">
            Get Started
          </button>
        </Link>
      </section>

      {/* YouTube Section ✅ FIXED */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Watch Our Latest Video
          </h2>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/_oeOBCNKPyo"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <a
            href="https://www.youtube.com/@omkkaar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-full"
          >
            Visit YouTube Channel
          </a>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(products.length ? products : gemstones)
            .slice(0, 3)
            .map((p) => (
              <div key={p.id || p._id} className="bg-white p-4 rounded shadow">
                <img
                  src={p.image}
                  className="h-40 w-full object-cover mb-3"
                />
                <h4 className="font-bold">{p.title}</h4>
                <p className="text-orange-500">₹{p.price}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <h2 className="text-center text-2xl font-bold mb-8">
          What Clients Say
        </h2>
        <TestimonialsCarousel />
      </section>
    </div>
  );
}
