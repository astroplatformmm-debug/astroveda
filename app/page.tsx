"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { gemstones } from "@/lib/mockData";
import type { Product, Service } from "@/lib/types";
import TestimonialsSection from "@/components/reviews/TestimonialsSection";

const testimonials = [
  {
    name: "Jaijeet Mohanty",
    rating: 5,
    review:
      "Thank you for the insight and clarity you bring through your work. Your ability to interpret the stars with such wisdom, compassion, and intuition is truly admirable. I appreciate the time, dedication, and positive energy you invest in every reading.Your guidance offers a sense of direction, comfort, and deeper understanding, and it genuinely makes a difference.", 
    initial: "J",
  },
  {
    name: "Pooja",
    rating: 5,
    review:
      "Recently I visited Guruji for an astrology consultation, and I am truly grateful for the experience. The depth, clarity, and wisdom in his guidance felt less like a service and more like learning from a true teacher. His remedies have brought real, positive change in my life, and the way he explains everything with patience and understanding makes you feel more like a disciple than a client. Thank you, Guruji, for your knowledge and support.",
    initial: "P",
  },
  {
    name: "Sunita Verma",
    rating: 5,
    review:
      "I was skeptical at first but after the consultation I am a true believer. The predictions were amazingly accurate. Thank you Mukesh ji!",
    initial: "S",
  },
  {
    name: "Amit Patel",
    rating: 5,
    review:
      "Got my Vastu consultation done. The changes suggested were simple but made a huge difference in the energy of our home. Wonderful experience.",
    initial: "A",
  },
  {
    name: "Neha Gupta",
    rating: 5,
    review:
      "The Kundli report was very detailed and professional. Mukesh ji explained everything patiently. Will definitely come back for more consultations.",
    initial: "N",
  },
  {
    name: "Vikram Singh",
    rating: 5,
    review:
      "Amazing experience. The rudraksha recommended for me has brought great peace of mind. Service is authentic and trustworthy.",
    initial: "V",
  },
  {
    name: "Anita Joshi",
    rating: 5,
    review:
      "Got my marriage compatibility checked. The analysis was thorough and helped us make an informed decision. Very professional service.",
    initial: "A",
  },
  {
    name: "Deepak Sharma",
    rating: 5,
    review:
      "ISO certified professional with genuine knowledge. The numerology consultation was eye-opening. Strongly recommend to everyone.",
    initial: "D",
  },
  {
    name: "Kavita Mishra",
    rating: 5,
    review:
      "Omkkaar Astroworld is truly authentic. The healing crystal I purchased has amazing energy. Fast delivery and great packaging too.",
    initial: "K",
  },
  {
    name: "Suresh Yadav",
    rating: 5,
    review:
      "The best astrology consultation I have had. Mukesh ji predicted things so accurately it was unbelievable. Life changing experience.",
    initial: "S",
  },
];

function TestimonialsCarousel() {
  const [start, setStart] = useState(0);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPerView(mq.matches ? 3 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const maxStart = Math.max(0, testimonials.length - perView);

  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [perView, maxStart]);

  useEffect(() => {
    const t = setInterval(() => {
      setStart((s) => (s >= maxStart ? 0 : s + 1));
    }, 4000);
    return () => clearInterval(t);
  }, [maxStart]);

  const goPrev = useCallback(() => {
    setStart((s) => (s <= 0 ? maxStart : s - 1));
  }, [maxStart]);

  const goNext = useCallback(() => {
    setStart((s) => (s >= maxStart ? 0 : s + 1));
  }, [maxStart]);

  const visible = testimonials.slice(start, start + perView);

  return (
    <div className="relative min-w-0">
      <div className="flex items-stretch justify-center gap-4 md:gap-6 min-w-0">
        <button
          type="button"
          onClick={goPrev}
          className="hidden md:flex shrink-0 self-center w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#F97316] font-bold items-center justify-center hover:bg-[#FFF7ED] transition-colors shadow-sm"
          aria-label="Previous testimonials"
        >
          ←
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1 min-w-0">
          {visible.map((t, idx) => (
            <div
              key={`${start}-${idx}-${t.name}`}
              className="bg-white p-5 sm:p-8 rounded-xl shadow-sm border border-[#E2E8F0] relative flex flex-col h-full min-h-[240px] sm:min-h-[280px]"
            >
              <div className="text-[#F97316] text-xl mb-4">
                {"⭐".repeat(t.rating)}
              </div>
              <p className="text-[#0F172A] italic mb-6 flex-grow leading-relaxed">&quot;{t.review}&quot;</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xl">
                  {t.initial}
                </div>
                <div>
                  <h5 className="font-bold text-[#0F172A]">{t.name}</h5>
                  <span className="text-[#64748B] text-xs font-semibold">Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="hidden md:flex shrink-0 self-center w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#F97316] font-bold items-center justify-center hover:bg-[#FFF7ED] transition-colors shadow-sm"
          aria-label="Next testimonials"
        >
          →
        </button>
      </div>
      <div className="flex md:hidden justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={goPrev}
          className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#F97316] font-bold shadow-sm"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] text-[#F97316] font-bold shadow-sm"
          aria-label="Next"
        >
          →
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxStart + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStart(i)}
            className={`h-2 rounded-full transition-all ${i === start ? "bg-[#F97316] w-4" : "bg-gray-300 w-2"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const text = await res.text();
        let payload: unknown;
        try {
          payload = JSON.parse(text) as unknown;
        } catch {
          console.error(
            "Failed to fetch services: server returned non-JSON (is MONGODB_URI set and is /api/services reachable?). Preview:",
            text.slice(0, 160),
          );
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
          throw new Error(msg);
        }
        if (!Array.isArray(payload)) {
          console.error("Failed to fetch services: expected JSON array");
          return;
        }
        setServices(payload as Service[]);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setServicesLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const text = await res.text();
        let payload: unknown;
        try {
          payload = JSON.parse(text) as unknown;
        } catch {
          console.error("Failed to fetch products: non-JSON response. Preview:", text.slice(0, 160));
          return;
        }
        if (res.ok && Array.isArray(payload)) {
          setProducts(payload);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchServices();
    fetchProducts();
  }, []);

  const homeVastu = services.find((s) => s.title.toLowerCase().includes("home vastu"));
  const officeVastu = services.find((s) => s.title.toLowerCase().includes("office vastu"));
  const industrialVastu = services.find((s) => s.title.toLowerCase().includes("industrial vastu"));

  const kundliService = services.find((s) => s.title.toLowerCase().includes("kundli"));

  const features = [
    { icon: "📋", title: "Detailed Kundli Report", text: "Comprehensive 20+ page PDF analyzing all 12 houses of your life." },
    { icon: "⚡", title: "Expert Consultation", text: "1-on-1 session to decode your chart and answer pressing questions." },
    { icon: "🕐", title: "Fast Delivery", text: "Get your personalized reading and report delivered within 24 hours." },
    { icon: "🛡️", title: "Lifetime Access", text: "Keep your digital reports forever to reference as your life unfolds." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
      
      {/* Hero Section */}
      <section className="bg-[#FAF7F2] min-h-screen flex items-center pt-8 pb-20 md:pt-12 md:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <div className="space-y-6 min-w-0">
            <span className="inline-block bg-[#FFF7ED] text-[#F97316] font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#F97316]/20">
              ✦ EXPERT VEDIC ASTROLOGY
            </span>
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-black leading-tight break-words">
              <span className="text-[#0F172A]">TALK TO</span> <span className="text-[#F97316]">EXPERT ASTROLOGER NOW!</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-[#0F172A] mt-4">
              Get Your Personalized Kundli Report + Expert Consultation from Certified Vedic Astrologer
            </p>
            <p className="text-[#64748B] text-base md:text-lg leading-relaxed max-w-lg">
              Discover your cosmic destiny, career path, love life, and financial future through ancient Vedic wisdom. Receive a detailed PDF report + 30-minute consultation within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="https://www.omkkaar.com/services?category=astrology" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA6C0A] transition-all duration-200 text-center shadow-lg hover:shadow-xl">
                  Get My Kundli Now
                </button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-[#0F172A] text-[#0F172A] font-bold rounded-lg hover:bg-[#0F172A] hover:text-white transition-all duration-200 text-center">
                  Talk to Astrologer Now
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#E2E8F0] relative max-w-md mx-auto w-full">
            <span className="absolute -top-4 -right-2 sm:-right-4 bg-white border border-[#E2E8F0] text-[#0F172A] font-bold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg z-10">
              🏅 25+ Years of Experience
            </span>
            <div className="w-full min-h-48 sm:min-h-64 max-h-80 sm:max-h-none sm:h-64 bg-gray-100 rounded-xl mb-6 overflow-hidden">
              <img
                src="/astrologer.png"
                alt="Expert Astrologer"
                className="w-full h-full min-h-48 sm:min-h-64 object-cover object-[50%_15%] sm:scale-110 max-w-full"
              />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-[#0F172A] font-playfair">Mukesh Ravindra Gupta</h3>
              <span className="bg-[#F97316] text-white text-xs p-0.5 rounded-full">✓</span>
            </div>
            <p className="text-[#F97316] font-semibold text-sm mb-3">Certified Vedic Astrologer and Vastu Consultant</p>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#F97316] text-lg">⭐⭐⭐⭐⭐</span>
              <span className="text-[#64748B] text-sm font-medium">5.0 (12k+ Consultations)</span>
            </div>
            <ul className="space-y-2 text-[#64748B] text-sm mb-8">
              <li className="flex items-start gap-2"><span className="text-[#F97316]">●</span> Expert in Vedic Astrology, Numerology & Vastu</li>
              <li className="flex items-start gap-2"><span className="text-[#F97316]">●</span> ISO 9001-2015 Certified Professional</li>
              <li className="flex items-start gap-2"><span className="text-[#F97316]">●</span> Trademark Certified Professional</li>
              <li className="flex items-start gap-2"><span className="text-[#F97316]">●</span> Specializes in Life, Career & Marriage Remedies</li>
            </ul>
            <Link href="/contact">
              <button className="block w-full py-3.5 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA6C0A] transition-all duration-200 text-center shadow-md">
                Consult Now
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#FFF7ED] rounded-full flex items-center justify-center text-2xl mb-4 text-[#F97316]">
                {feat.icon}
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-2">{feat.title}</h4>
              <p className="text-[#64748B] text-sm leading-relaxed">{feat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* YouTube */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto text-center min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3 font-playfair">Watch Our Latest Video</h2>
          <p className="text-[#64748B] mb-8">
            Learn about Vedic Astrology and how it can transform your life
          </p>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl aspect-video bg-black">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/_oeOBCNKPyo"
              title="Omkkaar Astroworld — Expert Vedic Astrology"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <a
            href="https://www.youtube.com/@omkkaar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all duration-200"
          >
            ▶ Visit Our YouTube Channel
          </a>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="bg-[#FAF7F2] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Explore Categories</h2>
            <p className="text-[#64748B] text-lg font-medium">Shop by Purpose</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Healing Crystals", icon: "💎", value: "healing" },
              { label: "Gemstones", icon: "✨", value: "gemstones" },
              { label: "Rudraksha", icon: "📿", value: "rudraksha" },
              { label: "Pooja Items", icon: "🪔", value: "pooja" },
            ].map((cat) => (
              <Link href={`/shop?category=${cat.value}`} key={cat.value} className="bg-white rounded-2xl p-4 sm:p-8 shadow-md border border-[#E2E8F0] flex flex-col items-center justify-center hover:scale-105 transition-all duration-200">
                <span className="text-4xl sm:text-5xl mb-2 sm:mb-4">{cat.icon}</span>
                <span className="font-bold text-[#0F172A] text-base sm:text-lg text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + Testimonials */}
      {/* Stats + Testimonials */}
<section className="bg-[#F8FAFC] py-16 sm:py-20 px-4 sm:px6 lg:px-8 border-b border-[#E2E8F0]">
  <div className="max-w-7xl mx-auto min-w-0">
    <div className="text-center mb-16">
      <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] px-2">
        Trusted by 5,000+ Clients Worldwide
      </h2>
    </div>

    {/* Stats grid stays as-is */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 sm:gap-6 mb-20 text-center">
      {[
        { num: "5,000+", label: "HAPPY CLIENTS" },
        { num: "25+", label: "Years EXPERIENCE" },
        { num: "4.9/5", label: "STAR RATING" },
        { num: "24-Hour", label: "DELIVERY" },
      ].map((stat, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-[#F97316] text-3xl mb-2">✦</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-1">{stat.num}</span>
          <span className="text-xs text-[#64748B] font-bold tracking-wider">{stat.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Testimonials + Review Form */}
<TestimonialsSection />

      {/* Pricing Section */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Choose Your Reading</h2>
            <p className="text-[#64748B] text-lg font-medium">Transparent pricing. No hidden fees. 100% Satisfaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto">
            {/* Home Vastu */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] flex flex-col h-full hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Home Vastu</h3>
              <div className="text-4xl font-extrabold text-[#0F172A] mb-6">₹10,000</div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  "Complete home Vastu analysis",
                  "Room-by-room recommendations",
                  "Lucky directions and placements",
                  "Written report with remedies",
                  "Follow-up consultation included",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F97316] mt-0.5">✓</span>
                    <span className="text-[#64748B] text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              {servicesLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full block py-3 border-2 border-[#0F172A] text-[#0F172A] text-center font-bold rounded-lg mt-auto opacity-70 cursor-wait"
                >
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0F172A] border-t-transparent" />
                </button>
              ) : (
                <Link
                  href={homeVastu?._id ? `/checkout?serviceId=${homeVastu._id}` : "/services"}
                  className="w-full block py-3 border-2 border-[#0F172A] text-[#0F172A] text-center font-bold rounded-lg hover:bg-[#0F172A] hover:text-white transition-colors mt-auto"
                >
                  Book Home Vastu
                </Link>
              )}
            </div>

            {/* Office Vastu */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#F97316] shadow-xl flex flex-col h-full relative transform md:-translate-y-4">
              <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#F97316] text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
                MOST POPULAR
              </span>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Office Vastu</h3>
              <div className="text-4xl font-extrabold text-[#0F172A] mb-6">₹15,000</div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  "Full office layout analysis",
                  "Cabin and seating directions",
                  "Energy flow optimization",
                  "Business growth remedies",
                  "Written report + 2 follow-ups",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F97316] mt-0.5">✓</span>
                    <span className="text-[#64748B] text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              {servicesLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full block py-3 bg-[#F97316] text-white text-center font-bold rounded-lg mt-auto shadow-md opacity-70 cursor-wait"
                >
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </button>
              ) : (
                <Link
                  href={officeVastu?._id ? `/checkout?serviceId=${officeVastu._id}` : "/services"}
                  className="w-full block py-3 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-center font-bold rounded-lg transition-colors mt-auto shadow-md"
                >
                  Book Office Vastu
                </Link>
              )}
            </div>

            {/* Industrial Vastu */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] flex flex-col h-full hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Industrial Vastu</h3>
              <div className="text-4xl font-extrabold text-[#0F172A] mb-6">₹30,000</div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  "Complete industrial unit analysis",
                  "Factory layout and machinery placement",
                  "Worker productivity optimization",
                  "Detailed Vastu compliance report",
                  "On-site visit included",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#F97316] mt-0.5">✓</span>
                    <span className="text-[#64748B] text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              {servicesLoading ? (
                <button
                  type="button"
                  disabled
                  className="w-full block py-3 border-2 border-[#0F172A] text-[#0F172A] text-center font-bold rounded-lg mt-auto opacity-70 cursor-wait"
                >
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0F172A] border-t-transparent" />
                </button>
              ) : (
                <Link
                  href={industrialVastu?._id ? `/checkout?serviceId=${industrialVastu._id}` : "/services"}
                  className="w-full block py-3 border-2 border-[#0F172A] text-[#0F172A] text-center font-bold rounded-lg hover:bg-[#0F172A] hover:text-white transition-colors mt-auto"
                >
                  Book Industrial Vastu
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Categories */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto min-w-0">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4">Shop by Categories</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { label: "Healing Crystals", icon: "💎", value: "healing" },
              { label: "Gemstones", icon: "✨", value: "gemstones" },
              { label: "Rudraksha", icon: "📿", value: "rudraksha" },
              { label: "Pooja Items", icon: "🪔", value: "pooja" },
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
                className={`rounded-2xl p-4 sm:p-6 shadow-sm border flex flex-col items-center justify-center hover:scale-105 transition-all duration-200 ${selectedCategory === cat.value ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'}`}
              >
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3">{cat.icon}</span>
                <span className="font-bold text-base sm:text-lg text-center">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(products.length > 0 ? products : gemstones)
              .filter((p) => {
                if (selectedCategory === "all") return true;
                const cat = (p as Product).category?.toLowerCase().trim();
                if (!cat) return false;
                return cat === selectedCategory;
              })
              .slice(0, 4)
              .map((gem) => (
              <div key={gem._id || gem.id} className="bg-white rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-[#E2E8F0] flex flex-col h-full shadow-md">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {gem.zodiac && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F172A] border border-[#E2E8F0] text-xs font-bold px-2 py-1 rounded z-10 uppercase tracking-wide">
                      {gem.zodiac}
                    </span>
                  )}
                  <img
                    src={gem.image || "https://picsum.photos/seed/default/600/400"}
                    alt={gem.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="font-bold text-[#0F172A] text-lg mb-2 leading-tight">{gem.title}</h4>
                  <p className="text-sm text-[#64748B] mb-4 flex-grow line-clamp-2">{gem.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#F97316] font-bold text-lg">₹{gem.price}</span>
                    <Link href={`/products/${gem._id || gem.id}`} className="px-4 py-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded transition-colors shadow-md">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/shop" className="inline-block px-8 py-3 bg-transparent border-2 border-[#0F172A] text-[#0F172A] font-bold rounded-lg hover:bg-[#0F172A] hover:text-white transition-all duration-200">
              View All Products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
