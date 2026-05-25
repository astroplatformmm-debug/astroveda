import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const baseUrl = "https://www.omkkaar.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/services`,           lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${baseUrl}/shop`,               lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/about`,              lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blogs`,              lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/contact`,            lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/book-slot`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/privacy-policy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/refund-policy`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/shipping-policy`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const Blog = mongoose.models.Blog ||
      mongoose.model("Blog", new mongoose.Schema({
        slug: String,
        updatedAt: Date,
        isPublished: Boolean,
      }));
    const blogs = await Blog.find({ isPublished: true }).select("slug updatedAt").lean() as { slug: string; updatedAt?: Date }[];
    blogPages = blogs.map((b) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: b.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // silently skip if DB unavailable during build
  }

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const Product = mongoose.models.Product ||
      mongoose.model("Product", new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        updatedAt: Date,
        isActive: Boolean,
      }));
    const products = await Product.find({ isActive: true }).select("_id updatedAt").lean() as { _id: mongoose.Types.ObjectId; updatedAt?: Date }[];
    productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p._id.toString()}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // silently skip if DB unavailable during build
  }

  return [...staticPages, ...blogPages, ...productPages];
}
