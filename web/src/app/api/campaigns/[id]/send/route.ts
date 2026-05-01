import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// PUT /api/campaigns/[id]/send — mark as sent + call Ecomail
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.status === "Sent") {
    return NextResponse.json({ error: "Already sent" }, { status: 409 });
  }

  // Get selected companies for Ecomail sync
  const decisions = await prisma.companyDecision.findMany({
    where: { campaignId: id, selected: true },
  });

  // Sync to Ecomail if configured
  const ecomailKey = process.env.ECOMAIL_API_KEY;
  const ecomailListId = process.env.ECOMAIL_LIST_ID;
  if (ecomailKey && ecomailListId && decisions.length > 0) {
    try {
      const subscriberData = decisions.map((d) => ({
        email: `kontakt@${d.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.cz`,
        name: d.companyName,
        status: "subscribed",
      }));

      await fetch(`https://api2.ecomailapp.cz/lists/${ecomailListId}/subscribe-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          key: ecomailKey,
        },
        body: JSON.stringify({
          subscriber_data: subscriberData,
          update_existing: true,
          resubscribe: true,
        }),
      });
    } catch (error) {
      console.error("Ecomail sync failed:", error);
      // Don't block the send on Ecomail failure
    }
  }

  // Mark as sent
  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: "Sent" },
  });

  await prisma.auditLog.create({
    data: {
      campaignId: id,
      action: "CampaignSent",
      performedBy: user.name,
      details: `Marked campaign '${campaign.name}' as sent (${decisions.length} companies synced to Ecomail)`,
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
