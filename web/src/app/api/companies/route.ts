import { NextResponse } from "next/server";
import type { RaynetCompany } from "@/types";

const MOCK_COMPANIES: RaynetCompany[] = [
  { companyId: "R001", companyName: "Alza.cz", accountManager: "Mariya Ivanova", systemType: "Muza", category: null },
  { companyId: "R002", companyName: "Mall.cz", accountManager: "Jan Novák", systemType: "BP1", category: null },
  { companyId: "R003", companyName: "Rohlik.cz", accountManager: "Mariya Ivanova", systemType: "Muza", category: null },
  { companyId: "R004", companyName: "Zásilkovna", accountManager: "Petra Horáková", systemType: "BP1", category: null },
  { companyId: "R005", companyName: "Notino", accountManager: "Jan Novák", systemType: "Muza", category: null },
  { companyId: "R006", companyName: "CZC.cz", accountManager: "Petra Horáková", systemType: "BP1", category: null },
  { companyId: "R007", companyName: "Lékárna.cz", accountManager: "Mariya Ivanova", systemType: "Muza", category: null },
  { companyId: "R008", companyName: "Knihy Dobrovský", accountManager: "Jan Novák", systemType: "BP1", category: null },
  { companyId: "R009", companyName: "Pilulka", accountManager: "Petra Horáková", systemType: "Muza", category: null },
  { companyId: "R010", companyName: "Bonami", accountManager: "Mariya Ivanova", systemType: "BP1", category: null },
  { companyId: "R011", companyName: "Datart", accountManager: "Jan Novák", systemType: "Muza", category: null },
  { companyId: "R012", companyName: "Mountfield", accountManager: "Petra Horáková", systemType: "BP1", category: null },
  { companyId: "R013", companyName: "Okay.cz", accountManager: "Mariya Ivanova", systemType: "Muza", category: null },
  { companyId: "R014", companyName: "Sportisimo", accountManager: "Jan Novák", systemType: "BP1", category: null },
  { companyId: "R015", companyName: "Tescoma", accountManager: "Petra Horáková", systemType: "Muza", category: null },
];

async function fetchFromRaynet(): Promise<RaynetCompany[]> {
  const apiKey = process.env.RAYNET_API_KEY;
  const instanceName = process.env.RAYNET_INSTANCE_NAME;

  if (!apiKey || !instanceName) return MOCK_COMPANIES;

  const companies: RaynetCompany[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://app.raynet.cz/api/v2/company/?offset=${offset}&limit=${limit}&status[eq]=ACTIVE`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${apiKey}:X`)}`,
          "X-Instance-Name": instanceName,
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // cache 5 min
      }
    );

    if (!res.ok) throw new Error(`Raynet API error: ${res.status}`);
    const json = await res.json();
    if (!json.data?.length) break;

    for (const c of json.data) {
      companies.push({
        companyId: String(c.id),
        companyName: c.name ?? `Company #${c.id}`,
        accountManager: c.owner?.fullName ?? "Nepřiřazeno",
        systemType: c.category?.value?.includes("BP1") ? "BP1" : "Muza",
        category: c.category?.value ?? null,
      });
    }

    offset += limit;
    if (json.data.length < limit) break;
  }

  return companies;
}

export async function GET() {
  try {
    const companies = await fetchFromRaynet();
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(MOCK_COMPANIES);
  }
}
