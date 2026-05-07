"use client";

import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewCarousel from "@/components/reviews/ReviewCarousel";

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#FFF7ED] via-white to-[#FFF7ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-[#F97316] text-sm font-bold uppercase tracking-widest mb-2">
            ✦ Testimonials
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#0F172A]">
            What Our Clients Say
          </h2>
          <p className="text-[#64748B] mt-3 text-sm sm:text-base max-w-xl mx-auto">
            Real experiences from people who have transformed their lives with
            Vedic guidance from OMKKAAR Astroworld.
          </p>
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#F97316]" />
            <svg
              className="w-4 h-4 text-[#F97316]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#F97316]" />
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT — Submit Review Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F5F9] p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="font-playfair text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <span className="w-7 h-7 bg-[#FFF7ED] rounded-full flex items-center justify-center text-[#F97316] text-sm">
                  ✍
                </span>
                Share Your Experience
              </h3>
              <p className="text-[#64748B] text-sm mt-1">
                Your feedback helps others make better decisions.
              </p>
            </div>
            <ReviewForm />
          </div>

          {/* RIGHT — Review Carousel */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F1F5F9] p-6 sm:p-8 min-h-[420px] flex flex-col">
            <div className="mb-6">
              <h3 className="font-playfair text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <span className="w-7 h-7 bg-[#FFF7ED] rounded-full flex items-center justify-center text-[#F97316] text-sm">
                  💬
                </span>
                Client Reviews
              </h3>
              <p className="text-[#64748B] text-sm mt-1">
                Verified experiences from our community.
              </p>
            </div>
            <div className="flex-1">
              <ReviewCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
