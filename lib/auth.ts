import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || !jwtSecret.trim()) {
    throw new Error("Please define the JWT_SECRET environment variable.");
  }
  return jwtSecret.trim();
}

type JwtPayload = {
  username: string;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export type RouteContext = {
  params: Promise<Record<string, string>>;
};

type AdminHandler = (
  req: NextRequest,
  context: RouteContext,
  adminPayload: JwtPayload,
) => Promise<Response>;

export function withAdminAuth(handler: AdminHandler) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      const token = req.cookies.get("admin_token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const adminPayload = verifyToken(token);
      return await handler(req, context, adminPayload);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
}
