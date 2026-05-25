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
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Vedic Astrology Blog — Omkkaar Astroworld",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedic Astrology Blog | Omkkaar Astroworld",
    description: "Expert articles on gemstones, Vastu, Kundli and Lal Kitab.",
    images: ["/astrologer.png"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",  item: "https://www.omkkaar.com" },
    { "@type": "ListItem", position: 2, name: "Blogs", item: "https://www.omkkaar.com/blogs" },
  ],
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
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
