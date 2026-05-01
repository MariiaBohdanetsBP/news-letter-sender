import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// POST /api/contacts/upload — upload CSV with contacts for a specific campaign
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const campaignId = formData.get("campaignId") as string | null;

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  if (!file || !file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "CSV file required" }, { status: 400 });
  }

  // Verify campaign exists
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must have header + at least 1 row" }, { status: 400 });
  }

  // Parse header — expect: company_id, company_name, email, contact_name (optional)
  const header = lines[0].toLowerCase().split(/[,;]/).map((h) => h.trim());
  const companyIdIdx = header.findIndex((h) => h.includes("company_id") || h.includes("companyid"));
  const companyNameIdx = header.findIndex((h) => h.includes("company_name") || h.includes("companyname") || h.includes("firma"));
  const emailIdx = header.findIndex((h) => h.includes("email") || h.includes("e-mail"));
  const contactNameIdx = header.findIndex((h) => h.includes("contact_name") || h.includes("contactname") || h.includes("jmeno") || h.includes("name"));

  if (emailIdx === -1) {
    return NextResponse.json(
      { error: "CSV must have an 'email' column. Found columns: " + header.join(", ") },
      { status: 400 }
    );
  }
  if (companyNameIdx === -1 && companyIdIdx === -1) {
    return NextResponse.json(
      { error: "CSV must have 'company_name' or 'company_id' column" },
      { status: 400 }
    );
  }

  // Parse rows
  const contacts: { companyId: string; companyName: string; email: string; contactName: string | null }[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = cols[emailIdx]?.toLowerCase();
    if (!email || !email.includes("@")) {
      errors.push(`Row ${i + 1}: invalid email`);
      continue;
    }
    const companyName = companyNameIdx >= 0 ? cols[companyNameIdx] || "" : "";
    const companyId = companyIdIdx >= 0 ? cols[companyIdIdx] || companyName : companyName;
    const contactName = contactNameIdx >= 0 ? cols[contactNameIdx] || null : null;

    contacts.push({ companyId, companyName, email, contactName });
  }

  if (contacts.length === 0) {
    return NextResponse.json({ error: "No valid rows found", details: errors }, { status: 400 });
  }

  // Replace contacts for this campaign only
  await prisma.contact.deleteMany({ where: { campaignId } });
  await prisma.contact.createMany({
    data: contacts.map((c) => ({
      campaignId,
      companyId: c.companyId,
      companyName: c.companyName,
      email: c.email,
      contactName: c.contactName,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    imported: contacts.length,
    errors: errors.length,
    errorDetails: errors.slice(0, 10),
  });
}
