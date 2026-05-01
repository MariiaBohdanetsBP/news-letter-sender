import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// GET /api/campaigns — list active (Processed) campaigns
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const campaigns = await prisma.campaign.findMany({
    where: { status: "Processed" },
    orderBy: { createdAt: "desc" },
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

// POST /api/campaigns — create a campaign
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { name, planDate } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const campaign = await prisma.campaign.create({
    data: {
      name,
      planDate: planDate ? new Date(planDate) : null,
      status: "Processed",
    },
  });

  await prisma.auditLog.create({
    data: {
      campaignId: campaign.id,
      action: "CampaignCreated",
      performedBy: user.name,
      details: `Created campaign '${campaign.name}'`,
    },
  });

  return NextResponse.json(
    {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      planDate: campaign.planDate?.toISOString().split("T")[0] ?? null,
      createdAt: campaign.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
