import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { withAdminAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  normalizeProductCategory,
  parseShopCategoryFilter,
  PRODUCT_CATEGORY_ENUM,
} from "@/lib/productCategory";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const category = req.nextUrl.searchParams.get("category");
    const verbose = process.env.NODE_ENV !== "production";
    if (verbose) {
      console.log("[GET /api/products] CATEGORY (raw):", category);
    }

    const query: Record<string, unknown> = { isActive: { $ne: false } };
    const slug = parseShopCategoryFilter(category);

    if (category?.trim() && slug === null && category.toLowerCase().trim() !== "all") {
      console.warn(
        "[GET /api/products] Unknown category param (ignored; returning all active products):",
        category,
        "| allowed:",
        PRODUCT_CATEGORY_ENUM,
      );
    }

    if (slug) {
      query.category = slug;
    }

    if (verbose) {
      console.log("[GET /api/products] MONGO_QUERY:", JSON.stringify(query));
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    if (verbose) {
      console.log("[GET /api/products] RESULT COUNT:", products.length);
    }

    if (slug && products.length === 0) {
      const distinct = await Product.distinct("category", { isActive: { $ne: false } });
      console.warn(
        "[GET /api/products] No rows for category slug:",
        slug,
        "| distinct categories (active):",
        distinct,
      );
    }

    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error: unknown) {
    console.error("[GET /api/products] FULL ERROR:", error);
    const err = error as Error & { stack?: string };
    console.error("[GET /api/products] error message:", err?.message);
    console.error("[GET /api/products] error stack:", err?.stack);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = withAdminAuth(async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    let imageUrl = body.image;

    if (imageUrl && imageUrl.startsWith("data:image")) {
      try {
        imageUrl = await uploadImage(imageUrl, "astroveda/products");
      } catch (err: unknown) {
        return NextResponse.json({ error: "Image upload failed: " + (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
      }
    }

    const imageUrls: string[] = [];
    if (body.images && Array.isArray(body.images)) {
      for (const imgBase64 of body.images) {
        if (typeof imgBase64 !== "string") continue;
        if (imgBase64.startsWith("data:image")) {
          try {
            imageUrls.push(await uploadImage(imgBase64, "astroveda/products"));
          } catch (err: unknown) {
            return NextResponse.json(
              { error: "Additional image upload failed: " + (err instanceof Error ? err.message : "Unknown error") },
              { status: 500 },
            );
          }
        } else if (imgBase64.startsWith("http")) {
          imageUrls.push(imgBase64);
        }
      }
    }

    const options = Array.isArray(body.options)
      ? body.options.filter(
          (x: unknown) =>
            x !== null &&
            typeof x === "object" &&
            typeof (x as { label: unknown }).label === "string" &&
            typeof (x as { price: unknown }).price === "number",
        )
      : [];

    const product = await Product.create({
      title: body.title,
      description: body.description,
      price: body.price,
      image: imageUrl,
      images: imageUrls,
      options,
      zodiac: body.zodiac,
      certification: body.certification,
      category: normalizeProductCategory(
        typeof body.category === "string" ? body.category.toLowerCase().trim() : body.category,
      ),
      ringMaterialEnabled: body.ringMaterialEnabled ?? false,
      ringMaterials: Array.isArray(body.ringMaterials) ? body.ringMaterials : [],
      benefits: Array.isArray(body.benefits)
        ? body.benefits.filter(
            (x: unknown) =>
              x !== null &&
              typeof x === "object" &&
              typeof (x as { label: unknown }).label === "string",
          )
        : [],
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("[PRODUCTS_POST] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
