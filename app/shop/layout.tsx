import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Certified Gemstones, Rudraksha & Healing Crystals Online India",
  description:
    "Shop genuine, certified gemstones, Rudraksha, healing crystals, and pooja items online. Ruby, Yellow Sapphire, Blue Sapphire, Emerald & more. Authentic products from Omkkaar Astroworld, Vadodara.",
  keywords: [
    "buy gemstones online India",
    "certified gemstones Vadodara",
    "original Rudraksha online",
    "buy Yellow Sapphire Pukhraj online",
    "buy Ruby Manik stone online",
    "healing crystals India",
    "buy Blue Sapphire Neelam",
    "pooja items online India",
    "authentic gemstones astrologer",
  ],
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Buy Certified Gemstones, Rudraksha & Healing Crystals Online India",
    description:
      "Genuine certified gemstones, Rudraksha & healing crystals from Omkkaar Astroworld Vadodara. Ruby, Sapphire, Emerald & more.",
    url: "https://www.omkkaar.com/shop",
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Certified Gemstones and Rudraksha — Omkkaar Astroworld",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Certified Gemstones & Rudraksha Online | Omkkaar Astroworld",
    description: "Genuine gemstones, Rudraksha & healing crystals from Vadodara.",
    images: ["/astrologer.png"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",  item: "https://www.omkkaar.com" },
    { "@type": "ListItem", position: 2, name: "Shop",  item: "https://www.omkkaar.com/shop" },
  ],
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
