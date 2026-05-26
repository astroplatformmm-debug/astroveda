"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Server error");
      }
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Hero Banner */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        {/* Mandala pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='%23F97316' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='60' fill='none' stroke='%23F97316' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%23F97316' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='20' fill='none' stroke='%23F97316' stroke-width='1'/%3E%3Cline x1='20' y1='100' x2='180' y2='100' stroke='%23F97316' stroke-width='0.5'/%3E%3Cline x1='100' y1='20' x2='100' y2='180' stroke='%23F97316' stroke-width='0.5'/%3E%3Cline x1='43' y1='43' x2='157' y2='157' stroke='%23F97316' stroke-width='0.5'/%3E%3Cline x1='157' y1='43' x2='43' y2='157' stroke='%23F97316' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#F97316] font-semibold uppercase tracking-widest text-sm mb-3">
              GET IN TOUCH
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair leading-tight">
              Contact Us
            </h1>
            <p className="text-[#94A3B8] mt-4 text-base md:text-lg max-w-md leading-relaxed">
              We&apos;re here to help and answer any question you might have.
              <br className="hidden sm:block" />
              We look forward to hearing from you.
            </p>
          </div>

          {/* Decorative Om symbol */}
          <div className="hidden md:flex items-center justify-center w-56 h-56 rounded-full border border-[#F97316]/20 relative">
            <div className="absolute inset-4 rounded-full border border-[#F97316]/10" />
            <span className="text-[#F97316] opacity-60" style={{ fontSize: "6rem", fontFamily: "serif" }}>
              ॐ
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Contact Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] font-playfair">Send Us a Message</h2>
              <p className="text-sm text-[#64748B] mt-0.5">
                Fill in the details below and we&apos;ll get back to you shortly.
              </p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] font-playfair">Message Sent!</h3>
              <p className="text-[#64748B] text-sm">
                Thank you for reaching out. We&apos;ll get back to you soon.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-2 px-6 py-2.5 rounded-full border border-[#F97316] text-[#F97316] text-sm font-medium hover:bg-[#FFF7ED] transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 transition-all"
                  />
                </div>
              </div>

              <input
                type="text"
                name="subject"
                placeholder="Subject *"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 transition-all"
              />

              <textarea
                name="message"
                placeholder="Your Message *"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 transition-all resize-y min-h-[140px]"
              />

              {status === "error" && (
                <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === "sending"}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 md:p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#0F172A] font-playfair border-b border-[#E2E8F0] pb-4">
            Contact Information
          </h2>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[#0F172A] font-semibold text-sm">Contact Number</p>
              <a href="tel:+917069110573" className="block text-[#F97316] text-sm hover:underline mt-1">
                +91 70691 10573
              </a>
              <a href="tel:+918733898927" className="block text-[#F97316] text-sm hover:underline">
                +91 63595 15655
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[#0F172A] font-semibold text-sm">Address</p>
              <p className="text-[#F97316] text-sm mt-1 leading-relaxed">
                22/FF, Emperor Building,<br />
                Fatehgunj, Vadodara, Gujarat
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[#0F172A] font-semibold text-sm">Email</p>
              <a href="mailto:askme@omkkaar.com" className="block text-[#F97316] text-sm hover:underline mt-1">
                askme@omkkaar.com
              </a>
            </div>
          </div>

          {/* Embedded Map */}
          <a
            href="https://www.google.com/maps/place/Omkkaar,+ff+22,+Emperor+Building,+Fatehgunj,+Vadodara"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2"
          >
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm cursor-pointer group">
              <div className="absolute inset-0 z-10 group-hover:bg-[#F97316]/5 transition-colors" />
              <iframe
                src="https://www.google.com/maps?q=Omkkaar+Astroworld+Vadodara&output=embed"
                className="w-full h-full pointer-events-none"
                title="Omkkaar Astroworld Location"
              />
            </div>
          </a>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[#0F172A] mt-4 mb-8 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto rounded-2xl px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full border-2 border-[#F97316]/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-[#F97316] font-semibold text-base md:text-lg">Need Immediate Assistance?</p>
            <p className="text-[#94A3B8] text-sm mt-0.5">
              Call us directly or email us. We&apos;ll be happy to assist you.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-4 h-4 text-[#F97316] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <div>
              <p>+91 70691 10573</p>
              <p>+91 87338 98927</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-[#1E293B]" />

          <div className="flex items-center gap-3 text-white">
            <svg className="w-4 h-4 text-[#F97316] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p>askme@omkkaar.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
