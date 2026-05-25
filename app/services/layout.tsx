import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vedic Astrology Services — Kundli, Vastu & Numerology Consultation",
  description:
    "Book Vedic astrology services with Mukesh Gupta in Vadodara: detailed Kundli reading, Lal Kitab remedies, Vastu consultation (home/office/industrial), numerology & marriage compatibility. 24-hr delivery.",
  keywords: [
    "Kundli reading online",
    "Vedic astrology consultation",
    "Vastu consultant Vadodara",
    "Lal Kitab remedies",
    "numerology consultation India",
    "marriage compatibility astrology",
    "home Vastu consultation",
    "office Vastu Vadodara",
    "online astrology service India",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Vedic Astrology Services — Kundli, Vastu & Numerology Consultation",
    description:
      "Book Kundli reading, Vastu consultation, and numerology services with certified astrologer Mukesh Gupta, Vadodara.",
    url: "https://www.omkkaar.com/services",
    images: [
      {
        url: "/astrologer.png",
        width: 1200,
        height: 630,
        alt: "Vedic Astrology Services — Omkkaar Astroworld Vadodara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedic Astrology Services | Omkkaar Astroworld",
    description: "Kundli, Vastu, Numerology & Tarot by certified astrologer Mukesh Gupta.",
    images: ["/astrologer.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Kundli reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Kundli (birth chart) reading is a detailed analysis of planetary positions at the time of your birth. It reveals insights about your personality, career, love life, health, and future. At Omkkaar, you receive a 20+ page PDF report along with a 30-minute expert consultation.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to receive my Kundli report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your personalised Kundli report and consultation are delivered within 24 hours of booking.",
      },
    },
    {
      "@type": "Question",
      name: "What is Vastu Shastra consultation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vastu Shastra is the ancient Indian science of architecture and space. A Vastu consultation analyses your home, office, or industrial space for energy flow and provides remedies to improve health, wealth, and harmony.",
      },
    },
    {
      "@type": "Question",
      name: "Which gemstone should I wear?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The right gemstone depends on your birth chart (Kundli) and planetary positions. It is recommended to consult a certified astrologer before wearing any gemstone. Book a consultation with Mukesh Gupta to get personalised gemstone recommendations.",
      },
    },
    {
      "@type": "Question",
      name: "Is the astrology consultation available online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, consultations are available online via phone or video call, as well as in-person at our Vadodara office. Reports are delivered as detailed PDF documents.",
      },
    },
    {
      "@type": "Question",
      name: "What is the cost of a Vastu consultation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Home Vastu consultation starts at ₹10,000, Office Vastu at ₹15,000, and Industrial Vastu at ₹30,000 (includes on-site visit). All plans include a written report with remedies.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",     item: "https://www.omkkaar.com" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://www.omkkaar.com/services" },
  ],
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
