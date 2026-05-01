import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.sub as string, name: payload.name as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
