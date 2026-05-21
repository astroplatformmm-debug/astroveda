import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vedic Astrology Blog — Gemstones, Vastu & Spiritual Guidance",
  description:
    "Read expert articles on Vedic astrology, gemstone benefits, Vastu tips, Rudraksha, numerology, and Lal Kitab remedies by certified astrologer Mukesh Gupta at Omkkaar Astroworld.",
  keywords: [
    "Vedic astrology blog",
    "gemstone benefits astrology",
    "Vastu tips for home",
    "Rudraksha benefits",
    "Lal Kitab remedies blog",
    "numerology tips India",
    "astrology articles Hindi English",
  ],
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Vedic Astrology Blog — Gemstones, Vastu & Spiritual Guidance",
    description:
      "Expert articles on Vedic astrology, gemstones, Vastu, and Lal Kitab by Mukesh Gupta at Omkkaar Astroworld.",
    url: "https://www.omkkaar.com/blogs",
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
