import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.omkkaar.com";
    const res = await fetch(`${baseUrl}/api/services/${id}`, { next: { revalidate: 60 } });

    if (!res.ok) throw new Error("Not found");

    const service = await res.json();

    const title = service.seoTitle || `${service.title} | Omkkaar Astroworld`;
    const description =
      service.seoDescription ||
      service.shortDescription ||
      service.description?.slice(0, 160) ||
      "Book expert Vedic astrology consultation with certified astrologer Mukesh Ravindra Gupta.";

    const canonical = `${baseUrl}/services/${service.slug || id}`;
    const ogImage = service.bannerImage || service.image || `${baseUrl}/astrologer.png`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        images: [{ url: ogImage, width: 1200, height: 630, alt: service.title }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
      other: {
        "script:ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.shortDescription || service.description,
          provider: {
            "@type": "Person",
            name: "Mukesh Ravindra Gupta",
            url: baseUrl,
          },
          offers: service.price
            ? {
                "@type": "Offer",
                price: service.price,
                priceCurrency: "INR",
              }
            : undefined,
          url: canonical,
          image: ogImage,
          ...(service.duration ? { duration: service.duration } : {}),
        }),
      },
    };
  } catch {
    return {
      title: "Astrology Service | Omkkaar Astroworld",
      description: "Book expert Vedic astrology consultations with certified astrologer Mukesh Ravindra Gupta.",
    };
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
