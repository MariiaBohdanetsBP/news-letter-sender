import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";
import ExcelJS from "exceljs";

// GET /api/campaigns/[id]/export — download Excel for Power BI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const decisions = await prisma.companyDecision.findMany({
    where: { campaignId: id },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Kampaň");

  sheet.columns = [
    { header: "Firma", key: "companyName", width: 30 },
    { header: "ID firmy", key: "companyId", width: 15 },
    { header: "Vybráno", key: "selected", width: 10 },
    { header: "Rozhodl/a", key: "decidedBy", width: 20 },
    { header: "Kampaň", key: "campaignName", width: 30 },
    { header: "Status kampaně", key: "campaignStatus", width: 15 },
    { header: "Datum odeslání", key: "sentDate", width: 18 },
  ];

  for (const d of decisions) {
    sheet.addRow({
      companyName: d.companyName,
      companyId: d.companyId,
      selected: d.selected ? "Ano" : "Ne",
      decidedBy: d.decidedBy,
      campaignName: campaign.name,
      campaignStatus: campaign.status === "Sent" ? "Odesláno" : "Zpracováno",
      sentDate: campaign.status === "Sent" ? campaign.updatedAt.toISOString().split("T")[0] : "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${campaign.name.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx"`,
    },
  });
}
