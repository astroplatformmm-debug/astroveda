import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import { withAdminAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

type Context = { params: Promise<Record<string, string>> };

export const PUT = withAdminAuth(async (req: NextRequest, context: Context) => {
  try {
    await connectDB();
    const params = await context.params;
    const id = params.id;
    const body = await req.json();

    if (body.image && body.image.startsWith("data:image")) {
      const uploadUrl = await uploadImage(body.image);
      if (uploadUrl) {
        body.image = uploadUrl;
      } else {
        throw new Error("Image upload failed");
      }
    }

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error: unknown) {
    console.error("[BLOG_PUT] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdminAuth(async (_req: NextRequest, context: Context) => {
  try {
    await connectDB();
    const params = await context.params;
    const id = params.id;
    
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[BLOG_DELETE] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
});
