"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50">
      
      {/* WhatsApp */}
      <a
        href="https://wa.me/917069110573"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M20.52 3.48A11.8 11.8 0 0012.03 0C5.39 0 .01 5.37.01 12c0 2.12.55 4.19 1.6 6.02L0 24l6.14-1.6A11.94 11.94 0 0012.03 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.51-8.52zM12.03 22c-1.87 0-3.7-.5-5.3-1.45l-.38-.22-3.64.95.97-3.55-.25-.36A9.9 9.9 0 012.03 12c0-5.51 4.49-10 10-10 2.67 0 5.17 1.04 7.07 2.93A9.93 9.93 0 0122.03 12c0 5.51-4.49 10-10 10zm5.48-7.35c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.65-.93-2.27-.24-.58-.49-.5-.68-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/omkkaar_astro/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M7.75 2C4.68 2 2 4.68 2 7.75v8.5C2 19.32 4.68 22 7.75 22h8.5C19.32 22 22 19.32 22 16.25v-8.5C22 4.68 19.32 2 16.25 2h-8.5zm4.25 5.5a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm0 2a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5zm4.75-2.88a1.13 1.13 0 110 2.26 1.13 1.13 0 010-2.26z" />
        </svg>
      </a>

      {/* X (Twitter) */}
      <a
        href="https://x.com/AstroworldOmkar"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18.244 2.25h3.308l-7.227 8.26L22.827 21.75H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

    </div>
  );
}
