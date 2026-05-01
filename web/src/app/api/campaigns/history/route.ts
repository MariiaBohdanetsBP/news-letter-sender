import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// GET /api/campaigns/history — sent campaigns
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const campaigns = await prisma.campaign.findMany({
    where: { status: "Sent" },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      planDate: c.planDate?.toISOString().split("T")[0] ?? null,
      createdAt: c.createdAt.toISOString(),
    }))
  );
}
