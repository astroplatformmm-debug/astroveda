import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mukesh Ravindra Gupta — Certified Vedic Astrologer Vadodara",
  description:
    "Meet Mukesh Ravindra Gupta — ISO 9001-2015 certified Vedic astrologer with 25+ years of experience in Vadodara. Expert in Kundli, Vastu, Numerology & Lal Kitab. 12,000+ consultations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Mukesh Ravindra Gupta — Certified Vedic Astrologer Vadodara",
    description:
      "25+ years of experience. ISO & Trademark certified. Expert in Kundli, Vastu, Numerology & Lal Kitab remedies.",
    url: "https://www.omkkaar.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
