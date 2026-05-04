"use client";

import { FaWhatsapp } from "react-icons/fa";
import {
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa6";

export default function FloatingSocials() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">

      {/* WhatsApp */}
      <a
  href="https://wa.me/917069110573"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
>
  <FaWhatsapp className="w-6 h-6" />
</a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/omkkaar_astro/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <FaInstagram className="w-5 h-5" />
      </a>

      {/* X */}
      <a
        href="https://x.com/AstroworldOmkar"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black hover:bg-zinc-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <FaXTwitter className="w-5 h-5" />
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/Omkar.Astroworld/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <FaFacebook className="w-5 h-5" />
      </a>

      {/* YouTube */}
      <a
        href="https://www.youtube.com/@omkkaar"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <FaYoutube className="w-5 h-5" />
      </a>

    </div>
  );
}
