import { Schema, model, models } from "mongoose";

export const SERVICE_CATEGORY_ENUM = [
  "astrology",
  "puja",
  "numerology",
  "vastu",
  "horoscope",
  "palmreading",
  "tarot",
] as const;

const serviceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    category: {
      type: String,
      enum: [...SERVICE_CATEGORY_ENUM],
      lowercase: true,
      trim: true,
      default: "astrology",
    },

    // Images
    image: { type: String, default: "" },          // thumbnail
    bannerImage: { type: String, default: "" },     // hero banner on detail page

    // Descriptions
    shortDescription: { type: String, default: "" },
    description: { type: String, required: true },  // full description (rich text stored as HTML string)

    // Structured content
    keyPoints: {
      type: [{ label: { type: String }, desc: { type: String } }],
      default: [],
    },
    benefits: {
      type: [{ label: { type: String }, desc: { type: String } }],
      default: [],
    },
    faq: {
      type: [{ question: { type: String }, answer: { type: String } }],
      default: [],
    },

    // Pricing & booking
    price: { type: Number, required: true },
    duration: { type: String, default: "" },

    // CTA
    ctaText: { type: String, default: "Book Now" },
    ctaLink: { type: String, default: "" },

    // SEO
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    // Ordering
    rank: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Auto-generate slug from title before save
serviceSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

serviceSchema.index({ isActive: 1, rank: -1, createdAt: -1 });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ slug: 1 });

const Service = models.Service || model("Service", serviceSchema);

export { generateSlug };
export default Service;
