"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/blogs", label: "Blogs" },
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
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  e.currentTarget.nextElementSibling?.classList.add('flex');
                }}
              />
              <div className="hidden flex-col items-start justify-center">
                <span className="font-playfair font-bold text-2xl text-[#0F172A] leading-none tracking-wide">
                  OMKKAAR
                </span>
                <span className="text-[#F97316] text-[10px] font-bold tracking-widest mt-1">
                  ASTROWORLD
                </span>
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
              
              <div className="flex items-center space-x-6 border-l border-[#E2E8F0] pl-6">
                <Link
                  href="/admin/login"
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/services"
                  className="shrink-0 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#F97316] text-white text-sm sm:text-base font-semibold hover:bg-[#EA6C0A] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap text-center"
                 >
                  ✦ Get My Kundli
                </Link>
              </div>
            </div>

            {/* Mobile Hamburger toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#0F172A] hover:text-[#F97316] focus:outline-none"
              >
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
          <div className="md:hidden bg-white border-b absolute left-0 right-0 top-full w-full max-w-[100vw] shadow-xl z-50 overflow-x-hidden">
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
              <div className="pt-4 border-t border-[#E2E8F0] mt-4 space-y-4">
                <Link
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full block text-center px-4 py-3 text-[#0F172A] font-medium hover:bg-gray-50 rounded-md"
                >
                  Login
                </Link>
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
