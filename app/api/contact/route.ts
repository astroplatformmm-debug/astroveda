import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";
import { withAdminAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// POST /api/contact  — public, saves submission to DB
export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDB();

    await Contact.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // Optional: send email via nodemailer if SMTP env vars are set
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: `"OMKKAAR Website" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: `New Contact Message: ${subject}`,
          html: `
            <h2 style="color:#F97316">New Contact Message</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Subject:</b> ${subject}</p>
            <p><b>Message:</b></p>
            <p style="background:#f9f9f9;padding:12px;border-left:4px solid #F97316">${message}</p>
          `,
        });
      } catch (emailErr) {
        // Email is optional - don't fail the request if SMTP is not configured
        console.warn("[contact] Email send failed (SMTP not configured?):", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact POST]", error);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

// GET /api/contact  — admin only, returns all contact submissions
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const onlyUnread = req.nextUrl.searchParams.get("unread") === "true";
    const query = onlyUnread ? { isRead: false } : {};
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[contact GET]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
});

// PATCH /api/contact  — admin only, mark as read
export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const { id, markAllRead } = await req.json();
    if (markAllRead) {
      await Contact.updateMany({}, { isRead: true });
    } else if (id) {
      await Contact.findByIdAndUpdate(id, { isRead: true });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact PATCH]", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
});

// DELETE /api/contact  — admin only
export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact DELETE]", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
});
