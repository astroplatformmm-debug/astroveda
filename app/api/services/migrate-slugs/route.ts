import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { withAdminAuth } from "@/lib/auth";
import { generateServiceSlug } from "@/lib/serviceCategory";

/**
 * POST /api/services/migrate-slugs
 * Admin-only. Finds all services without a slug (or with empty slug)
 * and auto-generates one from the title. Ensures uniqueness.
 */
export const POST = withAdminAuth(async () => {
  try {
    await connectDB();

    // Find services missing a slug
    const services = await Service.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }],
    }).lean();

    let updated = 0;

    for (const service of services) {
      const title = (service as { title?: string }).title || "";
      if (!title) continue;

      const baseSlug = generateServiceSlug(title);
      let slug = baseSlug;
      let suffix = 1;

      // Ensure uniqueness (skip the current doc's own _id)
      while (
        await Service.exists({ slug, _id: { $ne: (service as { _id: unknown })._id } })
      ) {
        slug = `${baseSlug}-${suffix++}`;
      }

      await Service.findByIdAndUpdate((service as { _id: unknown })._id, { slug });
      updated++;
    }

    return NextResponse.json({ updated, total: services.length });
  } catch (error: unknown) {
    console.error("[MIGRATE_SLUGS] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
