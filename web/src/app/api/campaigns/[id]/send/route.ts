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
  // Allow re-syncing contacts even if already sent

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
      const subscriberData: { email: string; name: string }[] = [];
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
            // Basic email validation before sending to Ecomail
            const email = m.email?.trim().toLowerCase();
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              subscriberData.push({ email, name: m.contactName ?? m.companyName });
            }
          }
        } else {
          missingCompanies.push(d.companyName);
        }
      }

      // Deduplicate by email
      const seen = new Set<string>();
      const uniqueSubscribers = subscriberData.filter((s) => {
        if (seen.has(s.email)) return false;
        seen.add(s.email);
        return true;
      });

      if (uniqueSubscribers.length > 0) {
        // Sync only matched contacts to Ecomail
        const ecoRes = await fetch(`https://api2.ecomailapp.cz/lists/${ecomailListId}/subscribe-bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", key: ecomailKey },
          body: JSON.stringify({
            subscriber_data: uniqueSubscribers,
            update_existing: true,
            resubscribe: true,
          }),
        });

        if (ecoRes.ok) {
          ecomailStatus = "sent";
          const foundCount = decisions.length - missingCompanies.length;
          ecomailMessage = `${uniqueSubscribers.length} emailů z ${foundCount} firem synchronizováno do Ecomail`;
        } else {
          const errBody = await ecoRes.text().catch(() => "");
          ecomailStatus = "error";
          ecomailMessage = `Ecomail vrátil chybu ${ecoRes.status}: ${errBody.slice(0, 200)}`;
          console.error("Ecomail error:", ecoRes.status, errBody);
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
