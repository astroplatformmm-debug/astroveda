import { Schema, model, models } from "mongoose";
import { PRODUCT_CATEGORY_ENUM } from "@/lib/productCategory";

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },   // ← NEW
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    options: {
      type: [{ label: { type: String }, price: { type: Number } }],
      default: [],
    },
    zodiac: { type: String, default: "" },
    certification: { type: String, default: "" },
    category: {
      type: String,
      enum: [...PRODUCT_CATEGORY_ENUM],
      lowercase: true,
      trim: true,
      default: "gemstones",
    },
    ringMaterialEnabled: { type: Boolean, default: false },
    ringMaterials: {
      type: [{ label: { type: String }, extraPrice: { type: Number, default: 0 } }],
      default: [],
    },
    benefits: {
      type: [{ label: { type: String }, desc: { type: String } }],
      default: [],
    },
    rank: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from title before save (only when missing)
productSchema.pre("save", async function () {
  if (this.isModified("title") && !this.slug) {
    this.slug = generateProductSlug(this.title);
  }
});

export function generateProductSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Indexes ──
productSchema.index({ isActive: 1, rank: -1, createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });   // ← NEW

const Product = models.Product || model("Product", productSchema);

export default Product;
