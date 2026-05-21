import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`https://www.omkkaar.com/api/blogs/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Blog not found");
    const blog = await res.json();

    return {
      title: blog.title,
      description: blog.excerpt || `Read about ${blog.title} on Omkkaar Astroworld blog.`,
      alternates: {
        canonical: `/blogs/${params.slug}`,
      },
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `https://www.omkkaar.com/blogs/${params.slug}`,
        images: blog.image ? [{ url: blog.image, alt: blog.title }] : [],
        type: "article",
      },
    };
  } catch {
    return {
      title: "Astrology Blog Post | Omkkaar Astroworld",
      description: "Expert Vedic astrology articles from Omkkaar Astroworld, Vadodara.",
    };
  }
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
