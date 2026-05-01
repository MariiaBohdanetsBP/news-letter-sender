import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";
import * as XLSX from "xlsx";

// POST /api/contacts/upload — upload CSV/XLSX with contacts for a specific campaign
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const campaignId = formData.get("campaignId") as string | null;

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const isCSV = file?.name.endsWith(".csv");
  const isXLSX = file?.name.endsWith(".xlsx") || file?.name.endsWith(".xls");

  if (!file || (!isCSV && !isXLSX)) {
    return NextResponse.json({ error: "CSV or XLSX file required" }, { status: 400 });
  }

  // Verify campaign exists
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  let rows: string[][];

  if (isXLSX) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];
    rows = rows.filter((r) => r.some((cell) => String(cell).trim() !== ""));
  } else {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    rows = lines.map((line) => line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, "")));
  }

  if (rows.length < 2) {
    return NextResponse.json({ error: "File must have header + at least 1 row" }, { status: 400 });
  }

  // Parse header — flexible column matching
  const header = rows[0].map((h) => String(h).toLowerCase().trim());
  const companyIdIdx = header.findIndex((h) => h.includes("company_id") || h.includes("companyid") || h.includes("client_id"));
  const companyNameIdx = header.findIndex((h) => h.includes("company_name") || h.includes("companyname") || h.includes("firma") || h.includes("client_name"));
  const emailIdx = header.findIndex((h) => h.includes("email") || h.includes("e-mail") || h === "login");
  const contactNameIdx = header.findIndex((h) => h.includes("contact_name") || h.includes("contactname") || h.includes("jmeno") || h === "name");

  if (emailIdx === -1) {
    return NextResponse.json(
      { error: "File must have an 'email' column. Found columns: " + header.join(", ") },
      { status: 400 }
    );
  }
  if (companyNameIdx === -1 && companyIdIdx === -1) {
    return NextResponse.json(
      { error: "File must have 'company_name' or 'company_id' column" },
      { status: 400 }
    );
  }

  // Parse rows
  const contacts: { companyId: string; companyName: string; email: string; contactName: string | null }[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].map((c) => String(c).trim());
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

  // Build per-company summary including selected companies with 0 contacts
  // Match by checking if names overlap (CSV may have short names vs full Raynet names)
  const contactsByName = new Map<string, { count: number; displayName: string }>();
  for (const c of contacts) {
    const key = (c.companyName || c.companyId).toLowerCase();
    const existing = contactsByName.get(key);
    if (existing) {
      existing.count++;
    } else {
      contactsByName.set(key, { count: 1, displayName: c.companyName || c.companyId });
    }
  }

  // Add selected companies, matching by substring to handle short vs full names
  const selectedDecisions = await prisma.companyDecision.findMany({
    where: { campaignId, selected: true },
  });

  const companySummary: { name: string; count: number }[] = [];
  const matchedKeys = new Set<string>();

  for (const d of selectedDecisions) {
    const dName = d.companyName.toLowerCase();
    // Find matching contact group: CSV name is contained in decision name or vice versa
    let found = false;
    for (const [key, val] of contactsByName) {
      if (dName.includes(key) || key.includes(dName)) {
        companySummary.push({ name: d.companyName, count: val.count });
        matchedKeys.add(key);
        found = true;
        break;
      }
    }
    if (!found) {
      companySummary.push({ name: d.companyName, count: 0 });
    }
  }

  // Add any CSV companies that weren't matched to a decision
  for (const [key, val] of contactsByName) {
    if (!matchedKeys.has(key)) {
      companySummary.push({ name: val.displayName, count: val.count });
    }
  }

  companySummary.sort((a, b) => b.count - a.count);

  return NextResponse.json({
    imported: contacts.length,
    errors: errors.length,
    errorDetails: errors.slice(0, 10),
    companySummary,
  });
}
