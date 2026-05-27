import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mukesh Ravindra Gupta — Certified Vedic Astrologer Vadodara",
  description:
    "Meet Mukesh Ravindra Gupta — ISO 9001-2015 certified Vedic astrologer with 25+ years of experience in Vadodara. Expert in Kundali, Vastu, Numerology & Lal Kitab. 12,000+ consultations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Mukesh Ravindra Gupta — Certified Vedic Astrologer Vadodara",
    description:
      "25+ years of experience. ISO & Trademark certified. Expert in Kundali, Vastu, Numerology & Lal Kitab remedies.",
    url: "https://www.omkkaar.com/about",
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Mukesh Ravindra Gupta — Certified Vedic Astrologer at Omkkaar Astroworld",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Mukesh Ravindra Gupta — Vedic Astrologer Vadodara",
    description: "ISO certified astrologer with 25+ years experience in Vadodara.",
    images: ["/astrologer.png"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mukesh Ravindra Gupta",
  jobTitle: "Certified Vedic Astrologer and Vastu Consultant",
  description:
    "ISO 9001-2015 and Trademark Certified Vedic Astrologer with 25+ years of experience. Specialises in Kundali analysis, Vastu, Numerology, and Lal Kitab remedies.",
  url: "https://www.omkkaar.com/about",
  image: "https://www.omkkaar.com/astrologer.png",
  telephone: "+917069110573",
  address: {
    "@type": "PostalAddress",
    streetAddress: "22/FF, The Emperor Building, Above Cake Shop, Fatehgunj",
    addressLocality: "Vadodara",
    addressRegion: "Gujarat",
    postalCode: "390002",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/omkkaar_astro/",
    "https://www.youtube.com/@omkkaar",
    "https://www.facebook.com/Omkar.Astroworld/",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Omkkaar Astroworld",
    url: "https://www.omkkaar.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",  item: "https://www.omkkaar.com" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://www.omkkaar.com/about" },
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
