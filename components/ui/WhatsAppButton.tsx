"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaYoutube,
  FaXmark,
} from "react-icons/fa6";

const socials = [
  {
    label: "WhatsApp",
    href: "https://wa.me/917069110573",
    icon: FaWhatsapp,
    color: "#25D366",
    shadow: "rgba(37,211,102,0.5)",
    glow: "rgba(37,211,102,0.3)",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/omkkaar_astro/",
    icon: FaInstagram,
    gradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    shadow: "rgba(220,39,67,0.5)",
    glow: "rgba(220,39,67,0.3)",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/AstroworldOmkar",
    icon: FaXTwitter,
    color: "#000000",
    shadow: "rgba(0,0,0,0.4)",
    glow: "rgba(100,100,100,0.3)",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Omkar.Astroworld/",
    icon: FaFacebook,
    color: "#1877F2",
    shadow: "rgba(24,119,242,0.5)",
    glow: "rgba(24,119,242,0.3)",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@omkkaar",
    icon: FaYoutube,
    color: "#FF0000",
    shadow: "rgba(255,0,0,0.5)",
    glow: "rgba(255,0,0,0.3)",
  },
];

// 3 brand icons shown on the toggle button
const previewIcons = [
  { icon: FaWhatsapp, bg: "#25D366" },
  { icon: FaInstagram, bg: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" },
  { icon: FaXTwitter, bg: "#000000" },
];

export default function FloatingSocials() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <div className="fixed bottom-6 right-5 flex flex-col items-end gap-3 z-50">

        {/* Social icons — stagger upward */}
        <div className="flex flex-col-reverse items-end gap-3">
          {socials.map((s, i) => {
            const Icon = s.icon;
            const delay = open ? i * 60 : (socials.length - 1 - i) * 40;
            const isHovered = hovered === i;

            return (
              <div
                key={s.label}
                className="relative flex items-center"
                style={{
                  transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.6)",
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? "auto" : "none",
                  transition: `transform 350ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, opacity 280ms ease ${delay}ms`,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                <span
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateX(0)" : "translateX(8px)",
                    transition: "all 200ms ease",
                    pointerEvents: "none",
                  }}
                  className="absolute right-14 whitespace-nowrap text-xs font-semibold text-white px-2.5 py-1 rounded-md bg-gray-900/90 backdrop-blur-sm shadow-lg"
                >
                  {s.label}
                  <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-900/90" />
                </span>

                {/* Icon */}
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: s.gradient ?? s.color,
                    boxShadow: isHovered
                      ? `0 0 0 3px ${s.glow}, 0 8px 24px ${s.shadow}`
                      : `0 4px 12px ${s.shadow}`,
                    transform: isHovered ? "scale(1.18) rotate(-5deg)" : "scale(1) rotate(0deg)",
                    transition: "all 250ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                  className="flex items-center justify-center w-11 h-11 rounded-full text-white"
                >
                  <Icon className="w-5 h-5" />
                </a>
              </div>
            );
          })}
        </div>

        {/* ── Toggle button ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close social links" : "Follow us on social media"}
          style={{
            transition: "all 300ms cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: open
              ? "0 4px 20px rgba(0,0,0,0.35)"
              : "0 4px 24px rgba(0,0,0,0.22)",
          }}
          className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-2.5 pr-4 py-2 cursor-pointer outline-none hover:shadow-xl"
        >
          {/* Pulse ring — only when closed */}
          {!open && (
            <span
              className="absolute inset-0 rounded-full animate-ping pointer-events-none"
              style={{ background: "rgba(249,115,22,0.15)", animationDuration: "2s" }}
            />
          )}

          {open ? (
            /* Close state */
            <>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                <FaXmark className="w-4 h-4 text-gray-600" />
              </span>
              <span className="text-xs font-semibold text-gray-500 leading-none">Close</span>
            </>
          ) : (
            /* Default state — social preview */
            <>
              {/* Stacked brand icons */}
              <div className="flex items-center">
                {previewIcons.map(({ icon: Icon, bg }, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: bg,
                      marginLeft: idx === 0 ? 0 : "-6px",
                      zIndex: previewIcons.length - idx,
                      border: "2px solid white",
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center relative text-white"
                  >
                    <Icon style={{ width: "13px", height: "13px" }} />
                  </span>
                ))}
              </div>
              {/* Label */}
              <span className="text-xs font-bold text-gray-700 leading-tight tracking-wide">
                Follow Us
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
