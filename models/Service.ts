import { Schema, model, models } from "mongoose";

const serviceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String },
    image: { type: String },
    category: {
      type: String,
      enum: ["astrology", "tarot", "numerology", "vastu"],
      default: "astrology",
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ── Indexes for fast queries ──
serviceSchema.index({ isActive: 1, createdAt: -1 });
serviceSchema.index({ category: 1, isActive: 1 });

const Service = models.Service || model("Service", serviceSchema);

export default Service;
