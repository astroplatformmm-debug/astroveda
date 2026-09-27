import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: {
    default: "Best Astrology Services Online & Offline in Vadodara, Gujarat | Omkkaar Astroworld",
    template: "%s | Omkkaar Astroworld",
  },
  description:
    "Omkkaar Astroworld offers accurate astrology services online and offline in Vadodara, Gujarat, including astrology consultation, Vastu, numerology, Lal Kitab remedies and tarot guidance.",
  keywords: [
    "best astrologer in Vadodara",
    "astrology services in Vadodara",
    "online astrology consultation",
    "offline astrology consultation Vadodara",
    "astrologer in Vadodara Gujarat",
    "Vastu consultant in Vadodara",
    "numerologist in Vadodara",
    "Lal Kitab remedies in Gujarat",
    "tarot card reading online",
    "Omkkaar Astroworld",
  ],
  authors: [{ name: "Mukesh Ravindra Gupta", url: "https://www.omkkaar.com/about" }],
  creator: "Omkkaar Astroworld",
  publisher: "Omkkaar Astroworld",
  metadataBase: new URL("https://www.omkkaar.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.omkkaar.com",
    siteName: "Omkkaar Astroworld",
    title: "Best Astrology Services Online & Offline in Vadodara, Gujarat | Omkkaar Astroworld",
    description:
      "Accurate astrology solutions for life, career, business and relationships. Online and offline astrology consultation in Vadodara, Gujarat.",
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Mukesh Ravindra Gupta — Certified Vedic Astrologer at Omkkaar Astroworld Vadodara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AstroworldOmkar",
    creator: "@AstroworldOmkar",
    title: "Best Astrology Services Online & Offline in Vadodara | Omkkaar Astroworld",
    description:
      "Accurate astrology services, Vastu, numerology, Lal Kitab remedies and tarot guidance online and offline in Vadodara, Gujarat.",
    images: ["/astrologer.png"],
  },
  verification: {
    google: "8zP1M-aSzQRLYM9sGiVxcIZKwCdV_vm0HGTCMvRIJHQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// LocalBusiness + Person JSON-LD schema for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.omkkaar.com/#business",
      name: "Omkkaar Astroworld",
      description:
        "ISO 9001-2015 certified Vedic astrology, Vastu consulting, and genuine gemstone shop in Vadodara, Gujarat. Expert guidance from Mukesh Ravindra Gupta with 25+ years of experience.",
      url: "https://www.omkkaar.com",
      telephone: "+917069110573",
      email: "askme@omkkaar.com",
      image: "https://www.omkkaar.com/logo.png",
      logo: "https://www.omkkaar.com/logo.png",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, Credit Card, UPI",
      address: {
        "@type": "PostalAddress",
        streetAddress: "22/FF, The Emperor Building, Above Cake Shop, Fatehgunj",
        addressLocality: "Vadodara",
        addressRegion: "Gujarat",
        postalCode: "390002",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 22.3119,
        longitude: 73.1723,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "19:00",
        },
      ],
      sameAs: [
        "https://www.facebook.com/Omkar.Astroworld/",
        "https://www.instagram.com/omkkaar_astro/",
        "https://x.com/AstroworldOmkar",
        "https://www.youtube.com/@omkkaar",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "12000",
        bestRating: "5",
        worstRating: "1",
      },
      hasMap: "https://www.google.com/maps/place/Omkkaar,+ff+22,+Emperor+Building,+Fatehgunj,+Vadodara",
    },
    {
      "@type": "Person",
      "@id": "https://www.omkkaar.com/#person",
      name: "Mukesh Ravindra Gupta",
      jobTitle: "Certified Vedic Astrologer and Vastu Consultant",
      description:
        "ISO 9001-2015 and Trademark Certified Vedic Astrologer with 25+ years of experience. Specialises in Kundali analysis, Vastu, Numerology, and Lal Kitab remedies.",
      url: "https://www.omkkaar.com/about",
      image: "https://www.omkkaar.com/astrologer.png",
      worksFor: { "@id": "https://www.omkkaar.com/#business" },
      sameAs: [
        "https://www.instagram.com/omkkaar_astro/",
        "https://www.youtube.com/@omkkaar",
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5SWXF42WG7" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5SWXF42WG7');
            `,
          }}
        />
        {/* Facebook Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '4351165591761590');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=4351165591761590&ev=PageView&noscript=1"/>`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <CartProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <WhatsAppButton />
          </LanguageProvider>
        </CartProvider>
      </body>
    </html>
  );
}
