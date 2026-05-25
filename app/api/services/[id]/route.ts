import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { withAdminAuth } from "@/lib/auth";
import { normalizeServiceCategory, generateServiceSlug } from "@/lib/serviceCategory";

type Context = { params: Promise<{ id: string }> };

/** Support lookup by MongoDB ObjectId OR slug */
async function findService(id: string) {
  // Try by slug first
  const bySlug = await Service.findOne({ slug: id, isActive: { $ne: false } }).lean();
  if (bySlug) return bySlug;
  // Fall back to ObjectId
  if (/^[a-f\d]{24}$/i.test(id)) {
    return await Service.findOne({ _id: id, isActive: { $ne: false } }).lean();
  }
  return null;
}

export async function GET(_req: Request, context: Context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const service = await findService(id);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: unknown) {
    console.error("[SERVICE_BY_ID_GET] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const PUT = withAdminAuth(async (req, context) => {
  try {
    await connectDB();
    const { id } = await (context.params as Promise<{ id: string }>);
    const body = await req.json();

    const updateData: Record<string, unknown> = {
      title: body.title,
      shortDescription: body.shortDescription ?? "",
      description: body.description,
      price: body.price,
      duration: body.duration ?? "",
      ctaText: body.ctaText ?? "Book Now",
      ctaLink: body.ctaLink ?? "",
      seoTitle: body.seoTitle ?? "",
      seoDescription: body.seoDescription ?? "",
    };

    if (typeof body.category === "string") {
      updateData.category = normalizeServiceCategory(body.category.toLowerCase().trim());
    }

    if (body.slug?.trim()) {
      updateData.slug = body.slug.trim();
    } else if (body.title) {
      updateData.slug = generateServiceSlug(body.title);
    }

    if (body.rank !== undefined) {
      updateData.rank = Number.isFinite(Number(body.rank)) ? Number(body.rank) : 0;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.image) {
      let imageUrl = body.image;
      if (imageUrl.startsWith("data:image")) {
        try {
          const { uploadImage } = await import("@/lib/cloudinary");
          imageUrl = await uploadImage(imageUrl, "astroveda/services");
        } catch (err: unknown) {
          return NextResponse.json({ error: "Thumbnail upload failed: " + (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
        }
      }
      updateData.image = imageUrl;
    }

    if (body.bannerImage) {
      let bannerUrl = body.bannerImage;
      if (bannerUrl.startsWith("data:image")) {
        try {
          const { uploadImage } = await import("@/lib/cloudinary");
          bannerUrl = await uploadImage(bannerUrl, "astroveda/services/banners");
        } catch (err: unknown) {
          return NextResponse.json({ error: "Banner upload failed: " + (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
        }
      }
      updateData.bannerImage = bannerUrl;
    }

    if (body.keyPoints !== undefined) {
      updateData.keyPoints = Array.isArray(body.keyPoints)
        ? body.keyPoints.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { label: unknown }).label === "string")
        : [];
    }

    if (body.benefits !== undefined) {
      updateData.benefits = Array.isArray(body.benefits)
        ? body.benefits.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { label: unknown }).label === "string")
        : [];
    }

    if (body.faq !== undefined) {
      updateData.faq = Array.isArray(body.faq)
        ? body.faq.filter((x: unknown) => x !== null && typeof x === "object" && typeof (x as { question: unknown }).question === "string")
        : [];
    }

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: unknown) {
    console.error("[SERVICE_BY_ID_PUT] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdminAuth(async (_req, context) => {
  try {
    await connectDB();
    const { id } = await (context.params as Promise<{ id: string }>);
    const service = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[SERVICE_BY_ID_DELETE] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
