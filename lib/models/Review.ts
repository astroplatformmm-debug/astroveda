import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  name: string;
  email?: string;
  rating: number;
  message: string;
  profile_image?: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  ip_address?: string;
  created_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    profile_image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Index for fast approved reviews fetch
ReviewSchema.index({ status: 1, featured: -1, created_at: -1 });
// Index to prevent duplicate reviews (same email + message within 24h)
ReviewSchema.index({ email: 1, created_at: 1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
