"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/Omkar.Astroworld/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/omkkaar_astro/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Twitter/X",
    url: "https://x.com/AstroworldOmkar",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@omkkaar",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="Omkkaar Astroworld" className="h-16 w-auto object-contain" />
          </Link>
          <p className="text-sm text-[#64748B] max-w-sm pt-2 leading-relaxed">
            Empowering your life journey with ancient Vedic wisdom and expert guidance from Mukesh Ravindra Gupta.
          </p>
          <div className="flex gap-3 mt-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#FFF7ED] text-[#F97316] rounded-full flex items-center justify-center hover:bg-[#F97316] hover:text-white transition-all duration-200"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[#0F172A] font-semibold mb-6 text-lg font-playfair">Quick Links</h4>
          <ul className="space-y-3 flex flex-col text-sm">
            <Link href="/" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Home
            </Link>
            <Link href="/shop" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Shop
            </Link>
            <Link href="/checkout" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Book Consultation
            </Link>
            <Link href="/about" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              About OMKKAAR
            </Link>
          </ul>
        </div>

        <div>
          <h4 className="text-[#0F172A] font-semibold mb-6 text-lg font-playfair">Contact Us</h4>
          <ul className="space-y-4 text-sm text-[#64748B] leading-relaxed">
            <li>
              <span className="font-semibold text-[#0F172A] block mb-1">Address</span>
              22/FF, The Emperor Building, Above Cake Shop, Fatehgunj, Vadodara - 390002, Gujarat, India
            </li>
            <li>
              <span className="font-semibold text-[#0F172A] block mb-1">Phone</span>
              <a href="tel:+917069110573" className="hover:text-[#F97316] transition-colors">
                +91 70691 10573
              </a>
            </li>
            <li>
              <span className="font-semibold text-[#0F172A] block mb-1">Email</span>
              <a href="mailto:askme@omkkaar.com" className="hover:text-[#F97316] transition-colors break-all">
                askme@omkkaar.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#0F172A] font-semibold mb-6 text-lg font-playfair">Legal</h4>
          <ul className="space-y-3 flex flex-col text-sm">
            <Link href="/privacy-policy" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Refund Policy
            </Link>
            <Link href="/shipping-policy" className="text-[#64748B] hover:text-[#F97316] transition-colors w-fit">
              Shipping Policy
            </Link>
          </ul>
        </div>
      </div>
      <div className="mt-6">
  <h5 className="text-[#0F172A] font-semibold mb-3 text-sm">
    Our Location
  </h5>

  <div className="w-full h-40 rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm">
    <iframe
      src="https://www.google.com/maps/dir//Omkkaar,+ff+22,+Emperor+Building,+opp.+apollo+pharmacy,+Jayesh+Colony,+Fatehgunj,+Vadodara,+Gujarat+390008/@26.848692,80.9425127,10z/data=!4m8!4m7!1m0!1m5!1m1!1s0x395fcfd4dbf7e4cb:0x223858921e0bbcd5!2m2!1d73.188879!2d22.3213049?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
    ></iframe>
  </div>
</div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#E2E8F0] text-center text-sm text-[#64748B]">
        <p>&copy; {new Date().getFullYear()} OMKKAAR ASTROWORLD. All rights reserved.</p>
      </div>
    </footer>
  );
}
