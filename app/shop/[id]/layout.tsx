import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.omkkaar.com";
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Product not found");
    const product = await res.json();

    const title = `Buy ${product.title} Online — Certified & Authentic | Omkkaar`;
    const description = `Buy original ${product.title} online from Omkkaar Astroworld, Vadodara. ${product.description?.slice(0, 120) || "Certified, authentic gemstone with expert consultation."}. Price: ₹${product.price}.`;

    // Use slug for canonical URL if available, fall back to id
    const canonical = `${baseUrl}/shop/${product.slug || id}`;
    const ogImage = product.image || `${baseUrl}/astrologer.png`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        images: product.image ? [{ url: product.image, alt: product.title }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      other: {
        "script:ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.image,
          offers: product.price
            ? {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              }
            : undefined,
          url: canonical,
        }),
      },
    };
  } catch {
    return {
      title: "Buy Gemstones Online India — Certified & Authentic | Omkkaar",
      description:
        "Shop certified gemstones, Rudraksha & healing crystals from Omkkaar Astroworld, Vadodara. Authentic products with expert guidance.",
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
