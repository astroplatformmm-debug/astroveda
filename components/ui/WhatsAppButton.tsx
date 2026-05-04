"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa6";
import { Plus } from "lucide-react";

export default function FloatingSocials() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">

      {/* Social Icons */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
        }`}
      >
        {/* WhatsApp */}
        <a
          href="https://wa.me/917069110573"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <FaWhatsapp className="w-5 h-5" />
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/omkkaar_astro/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <FaInstagram className="w-5 h-5" />
        </a>

        {/* X */}
        <a
          href="https://x.com/AstroworldOmkar"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black hover:bg-zinc-800 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <FaXTwitter className="w-5 h-5" />
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/Omkar.Astroworld/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <FaFacebook className="w-5 h-5" />
        </a>

        {/* YouTube */}
        <a
          href="https://www.youtube.com/@omkkaar"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <FaYoutube className="w-5 h-5" />
        </a>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-black text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300"
      >
        <Plus
          className={`w-6 h-6 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>
    </div>
  );
}
