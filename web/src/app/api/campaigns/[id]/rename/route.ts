import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// PUT /api/campaigns/[id]/rename
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldName = campaign.name;
  const updated = await prisma.campaign.update({
    where: { id },
    data: { name },
  });

  await prisma.auditLog.create({
    data: {
      campaignId: id,
      action: "CampaignRenamed",
      performedBy: user.name,
      details: `Renamed '${oldName}' → '${name}'`,
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    status: updated.status,
    planDate: updated.planDate?.toISOString().split("T")[0] ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
}
