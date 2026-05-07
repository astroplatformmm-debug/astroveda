import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";

// ── GET /api/reviews  ─ fetch approved reviews ──────────────────────────────
export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ status: "approved" })
      .sort({ featured: -1, created_at: -1 })
      .limit(50)
      .select("name rating message profile_image featured created_at")
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// ── POST /api/reviews  ─ submit a new review ────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, rating, message, profile_image } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Review message must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (message.trim().length > 1000) {
      return NextResponse.json(
        { error: "Review message must not exceed 1000 characters." },
        { status: 400 }
      );
    }

    // Email format check
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Anti-spam: check for duplicate review from same email within 7 days
    if (email) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const existing = await Review.findOne({
        email: email.toLowerCase().trim(),
        created_at: { $gte: sevenDaysAgo },
      });
      if (existing) {
        return NextResponse.json(
          {
            error:
              "You have already submitted a review recently. Please wait 7 days before submitting again.",
          },
          { status: 429 }
        );
      }
    }

    // Anti-spam: IP rate-limit (max 2 reviews per IP per 24h)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (ip !== "unknown") {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const ipCount = await Review.countDocuments({
        ip_address: ip,
        created_at: { $gte: oneDayAgo },
      });
      if (ipCount >= 2) {
        return NextResponse.json(
          {
            error:
              "Too many reviews submitted. Please try again after 24 hours.",
          },
          { status: 429 }
        );
      }
    }

    // Sanitise profile_image — must be base64 data URI or null
    let safeImage: string | undefined = undefined;
    if (profile_image && typeof profile_image === "string") {
      if (profile_image.startsWith("data:image/")) {
        // Limit to ~2MB
        if (profile_image.length > 2_800_000) {
          return NextResponse.json(
            { error: "Profile image must be smaller than 2 MB." },
            { status: 400 }
          );
        }
        safeImage = profile_image;
      }
    }

    const review = await Review.create({
      name: name.trim().slice(0, 100),
      email: email ? email.toLowerCase().trim().slice(0, 200) : undefined,
      rating: Number(rating),
      message: message.trim().slice(0, 1000),
      profile_image: safeImage,
      ip_address: ip,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for your review! It will appear after admin approval.",
        id: review._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}
