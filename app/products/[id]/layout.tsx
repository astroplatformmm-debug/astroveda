import type { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`https://www.omkkaar.com/api/products/${params.id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Product not found");
    const product = await res.json();

    const title = `Buy ${product.title} Online — Certified & Authentic | Omkkaar`;
    const description = `Buy original ${product.title} online from Omkkaar Astroworld, Vadodara. ${product.description?.slice(0, 120) || "Certified, authentic gemstone with expert consultation."}. Price: ₹${product.price}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/products/${params.id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://www.omkkaar.com/products/${params.id}`,
        images: product.image ? [{ url: product.image, alt: product.title }] : [],
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
