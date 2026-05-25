import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { withAdminAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { normalizeServiceCategory, parseServiceCategoryFilter, generateServiceSlug } from "@/lib/serviceCategory";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const category = req.nextUrl.searchParams.get("category");
    const query: Record<string, unknown> = { isActive: { $ne: false } };

    const slug = parseServiceCategoryFilter(category);
    if (slug) {
      query.category = slug;
    }

    const services = await Service.find(query)
      .select("title slug category image bannerImage shortDescription description price duration ctaText ctaLink rank keyPoints benefits")
      .sort({ rank: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(services, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    console.error("[SERVICES_GET] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = withAdminAuth(async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    let imageUrl = body.image || "";
    let bannerImageUrl = body.bannerImage || "";

    if (imageUrl && imageUrl.startsWith("data:image")) {
      try {
        imageUrl = await uploadImage(imageUrl, "astroveda/services");
      } catch (err: unknown) {
        return NextResponse.json(
          { error: "Thumbnail upload failed: " + (err instanceof Error ? err.message : "Unknown error") },
          { status: 500 },
        );
      }
    }

    if (bannerImageUrl && bannerImageUrl.startsWith("data:image")) {
      try {
        bannerImageUrl = await uploadImage(bannerImageUrl, "astroveda/services/banners");
      } catch (err: unknown) {
        return NextResponse.json(
          { error: "Banner upload failed: " + (err instanceof Error ? err.message : "Unknown error") },
          { status: 500 },
        );
      }
    }

    // Generate unique slug
    const baseSlug = body.slug?.trim() || generateServiceSlug(body.title || "");
    let slug = baseSlug;
    let suffix = 1;
    while (await Service.exists({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const service = await Service.create({
      title: body.title,
      slug,
      category: normalizeServiceCategory(typeof body.category === "string" ? body.category.toLowerCase().trim() : body.category),
      image: imageUrl,
      bannerImage: bannerImageUrl,
      shortDescription: body.shortDescription || "",
      description: body.description,
      keyPoints: Array.isArray(body.keyPoints) ? body.keyPoints.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { label: unknown }).label === "string") : [],
      benefits: Array.isArray(body.benefits) ? body.benefits.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { label: unknown }).label === "string") : [],
      faq: Array.isArray(body.faq) ? body.faq.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { question: unknown }).question === "string") : [],
      price: body.price,
      duration: body.duration || "",
      ctaText: body.ctaText || "Book Now",
      ctaLink: body.ctaLink || "",
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      rank: Number.isFinite(Number(body.rank)) ? Number(body.rank) : 0,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error("[SERVICES_POST] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
