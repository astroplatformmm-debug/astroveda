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
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
