"use client";

import { useState, useEffect, useRef } from "react";
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
    bg: "linear-gradient(135deg, #22c55e, #16a34a)",
    glow: "rgba(34,197,94,0.45)",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/omkkaar_astro/",
    icon: FaInstagram,
    bg: "linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)",
    glow: "rgba(236,72,153,0.45)",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/AstroworldOmkar",
    icon: FaXTwitter,
    bg: "linear-gradient(135deg, #1e293b, #334155)",
    glow: "rgba(30,41,59,0.5)",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/Omkar.Astroworld/",
    icon: FaFacebook,
    bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "rgba(59,130,246,0.45)",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@omkkaar",
    icon: FaYoutube,
    bg: "linear-gradient(135deg, #f87171, #dc2626)",
    glow: "rgba(220,38,38,0.45)",
  },
];

const previewIcons = [FaWhatsapp, FaInstagram, FaXTwitter];

export default function FloatingSocials() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ── Sliding social panel ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingRight: "10px",
          transform: open ? "translateX(0)" : "translateX(20px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "transform 420ms cubic-bezier(0.34,1.56,0.64,1), opacity 280ms ease",
        }}
      >
        {socials.map((s, i) => {
          const Icon = s.icon;
          const isHov = hovered === i;
          const staggerDelay = open ? i * 55 : 0;

          return (
            <div
              key={s.label}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                transform: open ? "translateX(0) scale(1)" : "translateX(18px) scale(0.75)",
                opacity: open ? 1 : 0,
                transition: `transform 380ms cubic-bezier(0.34,1.56,0.64,1) ${staggerDelay}ms, opacity 260ms ease ${staggerDelay}ms`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              <span
                style={{
                  position: "absolute",
                  right: "52px",
                  whiteSpace: "nowrap",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(15,23,42,0.92)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  opacity: isHov ? 1 : 0,
                  transform: isHov ? "translateX(0)" : "translateX(6px)",
                  transition: "all 180ms ease",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {s.label}
                <span
                  style={{
                    position: "absolute",
                    right: "-4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderLeft: "4px solid rgba(15,23,42,0.92)",
                  }}
                />
              </span>

              {/* Icon button */}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: s.bg,
                  boxShadow: isHov
                    ? `0 0 0 3px rgba(255,255,255,0.15), 0 8px 28px ${s.glow}`
                    : `0 4px 16px ${s.glow}`,
                  transform: isHov ? "scale(1.22) translateX(-3px)" : "scale(1) translateX(0)",
                  transition: "all 260ms cubic-bezier(0.34,1.56,0.64,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  color: "white",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  textDecoration: "none",
                }}
              >
                <Icon style={{ width: "18px", height: "18px" }} />
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
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease",
          boxShadow: open
            ? "-4px 0 24px rgba(249,115,22,0.4)"
            : "-4px 0 18px rgba(0,0,0,0.12)",
          background: open
            ? "linear-gradient(180deg, #f97316, #ea6c0a)"
            : "white",
          border: open ? "none" : "0.5px solid rgba(0,0,0,0.08)",
          borderRight: "none",
          borderRadius: "12px 0 0 12px",
          padding: "16px 9px",
          cursor: "pointer",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pulse glow when closed */}
        {!open && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background: "linear-gradient(180deg, transparent, rgba(249,115,22,0.07), transparent)",
              animation: "socialPulse 2.5s ease-in-out infinite",
            }}
          />
        )}

        {/* Mini icons strip */}
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
          {previewIcons.map((Icon, idx) => (
            <Icon
              key={idx}
              style={{
                width: "9px",
                height: "9px",
                color: open ? "rgba(255,255,255,0.7)" : "#f97316",
                transition: "color 300ms ease",
              }}
            />
          ))}
        </span>

        {/* Label */}
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: open ? "white" : "#1e293b",
            transition: "color 300ms ease",
            lineHeight: 1,
          }}
        >
          {open ? "close" : "follow"}
        </span>

        <style>{`
          @keyframes socialPulse {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}</style>
      </button>
    </div>
  );
}
