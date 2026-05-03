"use client";

export default function FloatingSocials() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">

      {/* WhatsApp */}
      <a
        href="https://wa.me/917069110573"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-green-500/40 transition-all duration-300 hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.52 3.48A11.8 11.8 0 0012.03 0C5.39 0 .01 5.37.01 12c0 2.12.55 4.19 1.6 6.02L0 24l6.14-1.6A11.94 11.94 0 0012.03 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.51-8.52z" />
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/omkkaar_astro/"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-3 rounded-full shadow-lg hover:shadow-pink-500/40 transition-all duration-300 hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M7.75 2C4.68 2 2 4.68 2 7.75v8.5C2 19.32 4.68 22 7.75 22h8.5C19.32 22 22 19.32 22 16.25v-8.5C22 4.68 19.32 2 16.25 2h-8.5zm4.25 5.5a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm0 2a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5zm4.75-2.88a1.13 1.13 0 110 2.26 1.13 1.13 0 010-2.26z" />
        </svg>
      </a>

      {/* X (Twitter) */}
      <a
        href="https://x.com/AstroworldOmkar"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-black hover:bg-zinc-800 text-white p-3 rounded-full shadow-lg hover:shadow-white/10 transition-all duration-300 hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26L22.827 21.75H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/Omkar.Astroworld/"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12z" />
        </svg>
      </a>

      {/* YouTube */}
      <a
        href="https://www.youtube.com/@omkkaar"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-red-500/40 transition-all duration-300 hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </a>

    </div>
  );
}
