"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_SLIDE = 4;

function AwardsPhotoCarousel({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick: (src: string) => void;
}) {
  const slides = useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < images.length; i += ITEMS_PER_SLIDE) {
      chunks.push(images.slice(i, i + ITEMS_PER_SLIDE));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [images]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slides[currentSlide]?.map((src, i) => (
          <button
            key={`${currentSlide}-${i}-${src}`}
            type="button"
            onClick={() => onImageClick(src)}
            className="rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 shadow-md border-0 p-0 bg-transparent block w-full text-left"
          >
            <img
              src={src}
              alt=""
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.classList.add("hidden");
                console.error("[About] Award image failed to load:", src);
              }}
            />
          </button>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrentSlide((p) => (p === 0 ? slides.length - 1 : p - 1))}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg text-[#F97316] hidden sm:block"
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg text-[#F97316] hidden sm:block"
            aria-label="Next slide"
          >
            →
          </button>
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? "bg-[#F97316] w-4" : "bg-gray-300 w-2"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const awards1Photos = [
    "/awards1/Advance Crystal Healing Certificate.png",
    "/awards1/Asian Awards Certificate.jpeg",
    "/awards1/Asian Awards Trophy.jpeg",
    "/awards1/MSU Certificate Astrology.jpg",
    "/awards1/Prerna Award.jpg",
    "/awards1/Tamas Global Awards Certificate.jpg",
    "/awards1/WhatsApp Image 2025-01-26 at 3.55.32 PM.jpeg",
  ];

  const awardsPhotos = [
    "/awards/(11546).JPG",
    "/awards/(13402).JPG",
    "/awards/20250608_190249.jpg",
    "/awards/2E1A3266.JPG",
    "/awards/2E1A3648 (1).jpg",
    "/awards/2E1A3648.JPG",
    "/awards/6M1A1039.JPG",
    "/awards/6M1A1123.JPG",
    "/awards/6M1A1505.JPG",
    "/awards/DSC_0253.JPG",
    "/awards/DSC_8775.JPG",
    "/awards/DSC_8776.JPG",
    "/awards/IMG-20181109-WA0011.jpg",
    "/awards/IMG_7832.JPG",
    "/awards/IMG_8989 (1).JPG",
    "/awards/IMG_8989.JPG",
    "/awards/MEET7524.JPG",
    "/awards/V_J19456.JPG",
    "/awards/V_J19458.JPG",
    "/awards/WhatsApp Image 2024-05-09 at 16.48.50_afb5b730.jpg",
    "/awards/WhatsApp Image 2025-03-22 at 9.58.10 PM.jpeg",
    "/awards/WhatsApp Image 2026-04-27 at 22.37.14.jpeg",
    "/awards/WhatsApp Image 2026-04-27 at 22.37.20.jpeg",
    "/awards/WhatsApp Image 2026-04-27 at 22.37.23.jpeg",
    "/awards/WhatsApp Image 2026-04-27 at 22.37.25.jpeg",
    "/awards/WhatsApp Image 2026-04-27 at 22.37.30.jpeg",
    "/awards/_J0A6182.JPG",
    "/awards1/A01_JPG-Copy.jpeg",
    "/awards1/A02_JPG-Copy.jpeg",
    "/awards1/A03_JPG1-Copy.jpeg",
    "/awards1/A04_JPG-Copy.jpeg",
    "/awards1/A05_JPG-Copy.jpeg",
    "/awards1/A06_JPG-Copy.jpeg",
    "/awards1/A07_JPG-Copy.jpeg",
    "/awards1/A08_JPG-Copy.jpeg",
    "/awards1/A09_JPG-Copy.jpeg",
    "/awards1/A10_JPG-Copy.jpeg",
    "/awards1/A11_JPG-Copy.jpeg",
    "/awards1/A12_JPG-Copy.jpeg",
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <section className="bg-white py-16 px-4 text-center border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto">
          <span className="text-[#F97316] text-sm font-bold tracking-widest uppercase mb-4 inline-block">About Us</span>
          <h1 className="font-playfair text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-6">
            Astrologer Mukesh Ravindra Gupta
          </h1>
          <div className="flex items-center justify-center gap-4 max-w-[200px] mx-auto">
            <div className="h-px bg-[#E2E8F0] flex-1" />
            <div className="w-2 h-2 bg-[#F97316] rotate-45" />
            <div className="h-px bg-[#E2E8F0] flex-1" />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative mx-auto lg:mx-0 w-full max-w-[450px]">
            <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-16 h-16 md:w-24 md:h-24 border-t-4 border-l-4 border-[#F97316] z-0" />
            <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-16 h-16 md:w-24 md:h-24 border-b-4 border-r-4 border-[#F97316] z-0" />
            <img src="/astrologer.png" alt="Mukesh Ravindra Gupta" className="w-full relative z-10 shadow-xl object-cover" />
          </div>

          <div className="space-y-6">
            <p className="text-[#64748B] text-lg leading-relaxed">
              With over 25 years of experience in Vedic Astrology, Mukesh Ravindra Gupta has guided thousands of people towards a better, happier and enlightened life. His accurate predictions and practical remedies have brought positive transformation in many lives across the globe.
            </p>
            <p className="text-[#64748B] text-lg leading-relaxed">
              He is an expert in Vedic Astrology, Numerology, Vastu Shastra, Gemstone Consultation and Spiritual Healing.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8">
              {[
                { icon: "⭐", num: "25+", label: "Years of Experience" },
                { icon: "👥", num: "50K+", label: "Happy Clients" },
                { icon: "🌍", num: "20+", label: "Countries Served" },
                { icon: "🏆", num: "35+", label: "Awards & Honors" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white p-4 sm:p-6 rounded-xl border border-[#E2E8F0] shadow-sm text-center hover:-translate-y-1 transition-transform"
                >
                  <span className="text-[#F97316] text-3xl block mb-2">{stat.icon}</span>
                  <span className="block text-2xl font-extrabold text-[#0F172A]">{stat.num}</span>
                  <span className="text-xs sm:text-sm font-bold text-[#64748B]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-4 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-[#0F172A] mb-4 tracking-wide">AWARDS & HONORS</h2>
            <div className="flex items-center justify-center gap-4 max-w-[150px] mx-auto">
              <div className="h-px bg-[#F97316] flex-1" />
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <div className="h-px bg-[#F97316] flex-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🏆", title: "Best Astrologer Award 2020", desc: "For exceptional contribution in astrology & guidance" },
              { icon: "🥇", title: "Excellence in Astrology 2021", desc: "For accurate predictions and client satisfaction" },
              { icon: "🏅", title: "Jyotish Ratna Award 2022", desc: "For outstanding services in Vedic Astrology" },
              { icon: "🌟", title: "Global Excellence Award 2023", desc: "For spiritual guidance and social impact" },
            ].map((award, i) => (
              <div key={i} className="bg-[#FAF7F2] p-6 md:p-8 rounded-xl border border-[#E2E8F0] text-center shadow-sm">
                <span className="text-4xl block mb-4">{award.icon}</span>
                <h3 className="font-bold text-[#0F172A] text-lg mb-2">{award.title}</h3>
                <p className="text-sm text-[#64748B]">{award.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="awards-section" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl font-bold text-[#0F172A] mb-4 tracking-wide uppercase">Awards from Celebrities</h2>
          <div className="flex items-center justify-center gap-4 max-w-[150px] mx-auto mb-4">
            <div className="h-px bg-[#F97316] flex-1" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#F97316]" />
            <div className="h-px bg-[#F97316] flex-1" />
          </div>
          <p className="text-sm text-[#64748B]">Click on any image to view full size</p>
        </div>

        <AwardsPhotoCarousel images={awardsPhotos} onImageClick={setLightboxImg} />
      </section>

      <section id="general-awards-section" className="py-20 px-4 max-w-7xl mx-auto border-t border-[#E2E8F0]">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl font-bold text-[#0F172A] mb-4 tracking-wide uppercase">Awards</h2>
          <div className="flex items-center justify-center gap-4 max-w-[150px] mx-auto mb-4">
            <div className="h-px bg-[#F97316] flex-1" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#F97316]" />
            <div className="h-px bg-[#F97316] flex-1" />
          </div>
          <p className="text-sm text-[#64748B]">Click on any image to view full size</p>
        </div>

        <AwardsPhotoCarousel images={awards1Photos} onImageClick={setLightboxImg} />
      </section>

      <section className="bg-[#F97316] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-4xl mb-6">📅</div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
            Consult Mukesh Ravindra Gupta for a better tomorrow.
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Book your appointment today and take the first step towards a greater, happier and successful life.
          </p>
          <Link
            href="/services"
            className="inline-block px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#F97316] transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </section>

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white text-4xl hover:text-[#F97316] focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImg(null);
            }}
          >
            &times;
          </button>
          <img
            src={lightboxImg}
            alt="Full size award"
            className="max-w-full max-h-[90vh] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
