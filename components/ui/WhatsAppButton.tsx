"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa6";

const socials = [
  {
    label: "WhatsApp",
    href: "https://wa.me/917069110573",
    icon: FaWhatsapp,
    color: "#25D366",
    shadow: "rgba(37,211,102,0.4)",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/omkkaar_astro/",
    icon: FaInstagram,
    gradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    shadow: "rgba(220,39,67,0.4)",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/AstroworldOmkar",
    icon: FaXTwitter,
    color: "#000000",
    shadow: "rgba(0,0,0,0.3)",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Omkar.Astroworld/",
    icon: FaFacebook,
    color: "#1877F2",
    shadow: "rgba(24,119,242,0.4)",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@omkkaar",
    icon: FaYoutube,
    color: "#FF0000",
    shadow: "rgba(255,0,0,0.4)",
  },
];

export default function FloatingSocials() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop — closes panel when tapped outside */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/*
        ── VERTICAL SIDE TAB ──────────────────────────────────────────────────
        Anchored to the RIGHT edge, vertically centred.
        The tab label is rotated 90° so it reads bottom-to-top.
        Social icons slide out to the LEFT when open.
        No bottom positioning = zero conflict with the mobile sticky CTA bar.
      */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center"
        style={{ pointerEvents: "none" }}
      >
        {/* ── Sliding icon panel ── */}
        <div
          className="flex flex-col gap-2 pr-2"
          style={{
            transform: open ? "translateX(0)" : "translateX(calc(100% + 52px))",
            opacity: open ? 1 : 0,
            transition: "transform 380ms cubic-bezier(0.34,1.56,0.64,1), opacity 260ms ease",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {socials.map((s, i) => {
            const Icon = s.icon;
            const isHovered = hovered === i;
            const delay = open ? i * 50 : 0;
            return (
              <div
                key={s.label}
                className="relative flex items-center group"
                style={{
                  transform: open ? "translateX(0) scale(1)" : "translateX(16px) scale(0.8)",
                  opacity: open ? 1 : 0,
                  transition: `transform 350ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, opacity 260ms ease ${delay}ms`,
                  pointerEvents: open ? "auto" : "none",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip — appears to the left of icon */}
                <span
                  className="absolute right-12 whitespace-nowrap text-xs font-semibold text-white px-2.5 py-1 rounded-md bg-gray-900/90 backdrop-blur-sm shadow-lg pointer-events-none select-none"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateX(0)" : "translateX(6px)",
                    transition: "all 180ms ease",
                  }}
                >
                  {s.label}
                  {/* Arrow pointing right */}
                  <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-900/90" />
                </span>

                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: (s as any).gradient ?? s.color,
                    boxShadow: isHovered
                      ? `0 0 0 3px ${s.shadow}, 0 6px 20px ${s.shadow}`
                      : `0 3px 10px ${s.shadow}`,
                    transform: isHovered ? "scale(1.18) rotate(-4deg)" : "scale(1) rotate(0deg)",
                    transition: "all 220ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-white"
                >
                  <Icon className="w-4.5 h-4.5" style={{ width: "18px", height: "18px" }} />
                </a>
              </div>
            );
          })}
        </div>

        {/* ── Vertical tab trigger ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close social links" : "Follow us on social media"}
          style={{
            pointerEvents: "auto",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            boxShadow: open
              ? "-3px 0 16px rgba(249,115,22,0.35)"
              : "-3px 0 16px rgba(0,0,0,0.18)",
            transition: "box-shadow 300ms ease, background 300ms ease",
          }}
          className={`
            relative flex items-center justify-center gap-2
            px-2 py-4 cursor-pointer outline-none select-none
            rounded-l-xl border border-r-0 border-gray-200
            ${open
              ? "bg-[#F97316] text-white border-[#F97316]"
              : "bg-white text-gray-700 hover:bg-[#FFF7ED] hover:text-[#F97316]"
            }
          `}
        >
          {/* Pulse ring — only when closed */}
          {!open && (
            <span
              className="absolute inset-0 rounded-l-xl animate-ping pointer-events-none"
              style={{ background: "rgba(249,115,22,0.12)", animationDuration: "2.2s" }}
            />
          )}

          {/* Three stacked mini-icons (vertical) */}
          <span className="flex flex-col items-center gap-0.5 mb-1">
            {[FaWhatsapp, FaInstagram, FaXTwitter].map((Icon, idx) => (
              <Icon
                key={idx}
                style={{
                  width: "10px",
                  height: "10px",
                  color: open ? "rgba(255,255,255,0.85)" : "#F97316",
                }}
              />
            ))}
          </span>

          {/* Label — rotated by writingMode so it reads top→bottom */}
          <span
            className="text-[11px] font-bold tracking-widest uppercase leading-none"
            style={{ letterSpacing: "0.12em" }}
          >
            {open ? "Close" : "Follow"}
          </span>
        </button>
      </div>
    </>
  );
}
