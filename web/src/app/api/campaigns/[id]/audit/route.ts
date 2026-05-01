import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// GET /api/campaigns/[id]/audit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const logs = await prisma.auditLog.findMany({
    where: { campaignId: id },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json(
    logs.map((l) => ({
      action: l.action,
      performedBy: l.performedBy,
      details: l.details,
      timestamp: l.timestamp.toISOString(),
    }))
  );
}
