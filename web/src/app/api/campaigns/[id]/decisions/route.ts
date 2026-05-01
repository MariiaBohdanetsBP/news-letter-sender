import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// GET /api/campaigns/[id]/decisions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const decisions = await prisma.companyDecision.findMany({
    where: { campaignId: id },
  });

  return NextResponse.json(
    decisions.map((d) => ({
      companyId: d.companyId,
      companyName: d.companyName,
      selected: d.selected,
      decidedBy: d.decidedBy,
    }))
  );
}

// PUT /api/campaigns/[id]/decisions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { decisions } = await request.json();

  // Delete existing decisions and insert new ones
  await prisma.companyDecision.deleteMany({ where: { campaignId: id } });
  await prisma.companyDecision.createMany({
    data: decisions.map((d: { companyId: string; companyName: string; selected: boolean }) => ({
      campaignId: id,
      companyId: d.companyId,
      companyName: d.companyName,
      selected: d.selected,
      decidedBy: user.name,
    })),
  });

  const selectedCount = decisions.filter((d: { selected: boolean }) => d.selected).length;
  await prisma.auditLog.create({
    data: {
      campaignId: id,
      action: "DecisionsSaved",
      performedBy: user.name,
      details: `Saved decisions: ${selectedCount} of ${decisions.length} companies selected`,
    },
  });

  return NextResponse.json({ ok: true });
}
