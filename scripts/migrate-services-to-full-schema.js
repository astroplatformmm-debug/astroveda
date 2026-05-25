/**
 * One-time migration: adds slug, shortDescription, and other new fields
 * to existing Service documents that were created before the schema update.
 *
 * Run: node scripts/migrate-services-to-full-schema.js
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const Service = mongoose.model(
    "Service",
    new mongoose.Schema({}, { strict: false }),
  );

  const services = await Service.find({});
  console.log(`Found ${services.length} services`);

  for (const svc of services) {
    const updates = {};

    // Add slug if missing
    if (!svc.slug) {
      let slug = generateSlug(svc.title || "service");
      const existing = await Service.findOne({ slug, _id: { $ne: svc._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updates.slug = slug;
    }

    // Add shortDescription if missing
    if (!svc.shortDescription && svc.description) {
      updates.shortDescription = svc.description.slice(0, 160);
    }

    // Set defaults for new fields
    if (!svc.keyPoints) updates.keyPoints = [];
    if (!svc.benefits) updates.benefits = [];
    if (!svc.faq) updates.faq = [];
    if (!svc.ctaText) updates.ctaText = "Book Now";
    if (svc.rank === undefined) updates.rank = 0;

    if (Object.keys(updates).length > 0) {
      await Service.updateOne({ _id: svc._id }, { $set: updates });
      console.log(`Updated: ${svc.title} → slug: ${updates.slug || svc.slug}`);
    }
  }

  console.log("Migration complete");
  await mongoose.disconnect();
}

main().catch(console.error);
