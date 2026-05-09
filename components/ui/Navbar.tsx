"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/blogs", label: "Blogs" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <>
      <div className="bg-[#F97316] text-white text-center py-3 text-sm md:text-base font-medium px-3 sm:px-6 leading-snug break-words max-w-[100vw]">
        🔥 Limited Daily Consultations — 5 slots this week — Book soon!
      </div>
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24 md:h-28">

            {/* Logo */}
            <Link href="/" className="h-12 sm:h-14">
              <img
                src="/logo.png"
                alt="OMKKAAR ASTROWORLD"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  e.currentTarget.nextElementSibling?.classList.add("flex");
                }}
              />
              <div className="hidden flex-col items-start justify-center">
                <span className="font-playfair font-bold text-2xl text-[#0F172A] leading-none tracking-wide">OMKKAAR</span>
                <span className="text-[#F97316] text-[10px] font-bold tracking-widest mt-1">ASTROWORLD</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#EA6C0A] ${
                    pathname === link.href ? "text-[#F97316]" : "text-[#64748B]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center space-x-4 border-l border-[#E2E8F0] pl-6">
                {/* Cart Icon */}
                <Link href="/cart" className="relative text-[#64748B] hover:text-[#F97316] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  href="/services"
                  className="shrink-0 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#F97316] text-white text-sm sm:text-base font-semibold hover:bg-[#EA6C0A] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap text-center"
                >
                  ✦ Get My Kundli
                </Link>
              </div>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="md:hidden flex items-center gap-4">
              <Link href="/cart" className="relative text-[#64748B] hover:text-[#F97316]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsOpen(!isOpen)} className="text-[#0F172A] hover:text-[#F97316]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b absolute left-0 right-0 top-full w-full shadow-xl z-50">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-md text-base font-medium ${
                    pathname === link.href ? "text-[#F97316] bg-[#FFF7ED]" : "text-[#0F172A] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[#E2E8F0] mt-4">
                <Link
                  href="/services"
                  onClick={() => setIsOpen(false)}
                  className="w-full block text-center px-5 py-3 rounded-full bg-[#F97316] text-white font-medium hover:bg-[#EA6C0A] transition-all shadow-md"
                >
                  ✦ Get My Kundli Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
