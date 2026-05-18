import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Best Vedic Astrologer in Vadodara | Gemstones & Vastu – Omkkaar",
  description: "Consult certified Vedic astrologer Mukesh Gupta. 25+ yrs experience. Kundli reports, Vastu consultation, genuine gemstones & Rudraksha. 12,000+ happy clients. Book now!",
  verification: {
    google: "8zP1M-aSzQRLYM9sGiVxcIZKwCdV_vm0HGTCMvRIJHQ",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="canonical" href="https://www.omkkaar.com/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:wght@400..900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-inter: 'Inter', sans-serif;
            --font-playfair: 'Playfair Display', serif;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
