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
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
