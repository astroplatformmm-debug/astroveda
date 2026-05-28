import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { withAdminAuth } from "@/lib/auth";
import { generateProductSlug } from "@/lib/productCategory";

/**
 * POST /api/products/migrate-slugs
 * Admin-only. Finds all products without a slug (or with empty slug)
 * and auto-generates one from the title. Ensures uniqueness.
 */
export const POST = withAdminAuth(async () => {
  try {
    await connectDB();

    // Find products missing a slug
    const products = await Product.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
    }).lean();

    let updated = 0;

    for (const product of products) {
      const title = (product as { title?: string }).title || "";
      if (!title) continue;

      const baseSlug = generateProductSlug(title);
      let slug = baseSlug;
      let suffix = 1;

      // Ensure uniqueness (skip the current doc's own _id)
      while (
        await Product.exists({ slug, _id: { $ne: (product as { _id: unknown })._id } })
      ) {
        slug = `${baseSlug}-${suffix++}`;
      }

      await Product.findByIdAndUpdate((product as { _id: unknown })._id, { slug });
      updated++;
    }

    return NextResponse.json({ updated, total: products.length });
  } catch (error: unknown) {
    console.error("[MIGRATE_PRODUCT_SLUGS] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
