import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { withAdminAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const category = req.nextUrl.searchParams.get("category");
    const query: Record<string, unknown> = { isActive: true };
    if (category && category !== "all") {
      query.category = category.toLowerCase();
    }

    const services = await Service.find(query)
      .select("title description price duration image category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(services, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    console.error("[SERVICES_GET] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
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
      const { uploadImage } = await import("@/lib/cloudinary");
      try {
        imageUrl = await uploadImage(imageUrl);
      } catch (err: unknown) {
        return NextResponse.json(
          { error: "Image upload failed: " + (err instanceof Error ? err.message : "Unknown error") },
          { status: 500 },
        );
      }
    }

    const service = await Service.create({
      title: body.title,
      description: body.description,
      price: body.price,
      duration: body.duration,
      image: imageUrl,
      category: typeof body.category === "string" ? body.category.toLowerCase() : "astrology",
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error("[SERVICES_POST] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
