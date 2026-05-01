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
  let ecomailStatus: "sent" | "skipped" | "error" = "skipped";
  let ecomailMessage = "Ecomail API klíč není nastaven — přeskočeno";
  const ecomailKey = process.env.ECOMAIL_API_KEY;
  const ecomailListId = process.env.ECOMAIL_LIST_ID;

  if (ecomailKey && ecomailListId && decisions.length > 0) {
    try {
      // Look up real emails from uploaded contacts for this campaign
      const contacts = await prisma.contact.findMany({
        where: { campaignId: id },
      });

      // Build subscriber list using fuzzy name matching (CSV names vs Raynet names)
      const subscriberData: { email: string; name: string; status: string }[] = [];
      const missingCompanies: string[] = [];

      for (const d of decisions) {
        const dName = d.companyName.toLowerCase();
        // Find contacts whose companyName or companyId fuzzy-matches the decision company
        const matched = contacts.filter((c) => {
          const csvName = (c.companyName || c.companyId).toLowerCase();
          return csvName.includes(dName) || dName.includes(csvName);
        });
        if (matched.length > 0) {
          for (const m of matched) {
            subscriberData.push({ email: m.email, name: m.contactName ?? m.companyName, status: "subscribed" });
          }
        } else {
          missingCompanies.push(d.companyName);
        }
      }

      if (subscriberData.length > 0) {
        // Sync only matched contacts to Ecomail
        const ecoRes = await fetch(`https://api2.ecomailapp.cz/lists/${ecomailListId}/subscribe-bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", key: ecomailKey },
          body: JSON.stringify({
            subscriber_data: subscriberData,
            update_existing: true,
            resubscribe: true,
          }),
        });

        if (ecoRes.ok) {
          ecomailStatus = "sent";
          const foundCount = decisions.length - missingCompanies.length;
          ecomailMessage = `${subscriberData.length} emailů z ${foundCount} firem synchronizováno do Ecomail`;
        } else {
          ecomailStatus = "error";
          ecomailMessage = `Ecomail vrátil chybu ${ecoRes.status}`;
        }
      } else {
        ecomailStatus = "error";
        ecomailMessage = "Žádné emaily nalezeny v CSV — nic k aktualizaci";
      }

      // Attach warning about missing companies
      if (missingCompanies.length > 0) {
        ecomailMessage += ` | ⚠️ ${missingCompanies.length} firem bez emailu v CSV: ${missingCompanies.slice(0, 10).join(", ")}${missingCompanies.length > 10 ? "..." : ""}`;
      }
    } catch (error) {
      ecomailStatus = "error";
      ecomailMessage = `Ecomail sync selhal: ${error instanceof Error ? error.message : "unknown"}`;
      console.error("Ecomail sync failed:", error);
    }
  } else if (ecomailKey && ecomailListId && decisions.length === 0) {
    ecomailMessage = "Žádné firmy vybrány — nic k synchronizaci";
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
      details: `Marked campaign '${campaign.name}' as sent (${decisions.length} companies, ecomail: ${ecomailStatus})`,
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    status: updated.status,
    planDate: updated.planDate?.toISOString().split("T")[0] ?? null,
    createdAt: updated.createdAt.toISOString(),
    ecomail: { status: ecomailStatus, message: ecomailMessage },
  });
}
