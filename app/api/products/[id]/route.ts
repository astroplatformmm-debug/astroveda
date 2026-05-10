import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { withAdminAuth } from "@/lib/auth";
import { normalizeProductCategory } from "@/lib/productCategory";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const product = await Product.findOne({ _id: id, isActive: true }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("[PRODUCT_BY_ID_GET] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const PUT = withAdminAuth(async (req, context) => {
  try {
    await connectDB();
    const { id } = await (context.params as Promise<{ id: string }>);
    const body = await req.json();

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      price: body.price,
      zodiac: body.zodiac,
      certification: body.certification,
    };

    if (typeof body.category === "string") {
      updateData.category = normalizeProductCategory(body.category.toLowerCase().trim());
    }

    if (body.image) {
      let imageUrl = body.image;
      if (imageUrl.startsWith("data:image")) {
        try {
          const { uploadImage } = await import("@/lib/cloudinary");
          imageUrl = await uploadImage(imageUrl, "astroveda/products");
        } catch (err: unknown) {
          return NextResponse.json({ error: 'Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
        }
      }
      updateData.image = imageUrl;
    }

    if (body.images !== undefined) {
      const imageUrls: string[] = [];
      if (Array.isArray(body.images)) {
        for (const imgBase64 of body.images) {
          if (typeof imgBase64 !== "string") continue;
          if (imgBase64.startsWith("data:image")) {
            try {
              const { uploadImage } = await import("@/lib/cloudinary");
              imageUrls.push(await uploadImage(imgBase64, "astroveda/products"));
            } catch (err: unknown) {
              return NextResponse.json(
                { error: "Additional image upload failed: " + (err instanceof Error ? err.message : "Unknown error") },
                { status: 500 },
              );
            }
          } else if (imgBase64.startsWith("http")) {
            imageUrls.push(imgBase64);
          }
        }
      }
      updateData.images = imageUrls;
    }

    if (body.options !== undefined) {
      updateData.options = Array.isArray(body.options)
        ? body.options.filter(
            (x: unknown) =>
              x !== null &&
              typeof x === "object" &&
              typeof (x as { label: unknown }).label === "string" &&
              typeof (x as { price: unknown }).price === "number",
          )
        : [];
    }

    if (body.ringMaterialEnabled !== undefined) {
      updateData.ringMaterialEnabled = Boolean(body.ringMaterialEnabled);
    }
    if (body.ringMaterials !== undefined) {
      updateData.ringMaterials = Array.isArray(body.ringMaterials) ? body.ringMaterials : [];
    }
    if (body.benefits !== undefined) {
      updateData.benefits = Array.isArray(body.benefits)
        ? body.benefits.filter(
            (x: unknown) =>
              x !== null &&
              typeof x === "object" &&
              typeof (x as { label: unknown }).label === "string",
          )
        : [];
    }
    if (body.rank !== undefined) {
      updateData.rank = Number.isFinite(Number(body.rank)) ? Number(body.rank) : 0;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("[PRODUCT_BY_ID_PUT] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdminAuth(async (_req, context) => {
  try {
    await connectDB();
    const { id } = await (context.params as Promise<{ id: string }>);
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[PRODUCT_BY_ID_DELETE] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
