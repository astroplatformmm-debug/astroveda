import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Omkkaar Astroworld — Book Astrology Consultation Vadodara",
  description:
    "Contact Omkkaar Astroworld in Vadodara. Call +91 70691 10573 or email askme@omkkaar.com to book your Kundli, Vastu, or gemstone consultation with Mukesh Ravindra Gupta.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Omkkaar Astroworld — Vadodara",
    description:
      "Get in touch with certified Vedic astrologer Mukesh Gupta. Call, email, or visit us in Vadodara, Gujarat.",
    url: "https://www.omkkaar.com/contact",
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Contact Omkkaar Astroworld Vadodara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Omkkaar Astroworld | Vadodara",
    description: "Book your Kundli or Vastu consultation with Mukesh Gupta.",
    images: ["/astrologer.png"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",    item: "https://www.omkkaar.com" },
    { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.omkkaar.com/contact" },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
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
