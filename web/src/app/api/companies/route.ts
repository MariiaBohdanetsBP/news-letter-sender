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

async function fetchFromRaynet(): Promise<{ companies: RaynetCompany[]; source: "raynet" | "mock" }> {
    const apiUser = process.env.RAYNET_API_USER?.trim();
  const apiKey = process.env.RAYNET_API_KEY?.trim();
  const instanceName = process.env.RAYNET_INSTANCE_NAME?.trim();

  if (!apiUser || !apiKey || !instanceName) {
    return { companies: MOCK_COMPANIES, source: "mock" };
  }

  const companies: RaynetCompany[] = [];
  let offset = 0;
  const limit = 200; // Raynet max per request

  // Raynet Basic auth: "user@email.cz:apiToken"
  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  // Fetch companies (Raynet max limit is 200 per request)
  const res = await fetch(
    `https://app.raynet.cz/api/v2/company/?offset=${offset}&limit=${limit}`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "X-Instance-Name": instanceName,
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Raynet API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();

  if (json.data?.length) {
    // Only include actual clients (B_ACTUAL) with real owners
    const excludedOwners = new Set(["Import Import", "RAYNET CRM"]);
    for (const c of json.data) {
      if (c.state !== "B_ACTUAL") continue;
      const ownerName = c.owner?.fullName ?? "";
      if (excludedOwners.has(ownerName)) continue;
      companies.push({
        companyId: String(c.id),
        companyName: c.name ?? `Company #${c.id}`,
        accountManager: c.owner?.fullName ?? "Nepřiřazeno",
        systemType: c.category?.value?.includes("BP1") ? "BP1" : "Muza",
        category: c.category?.value ?? null,
      });
    }
  }

  return { companies, source: "raynet" };
}

export async function GET() {
  try {
    const { companies, source } = await fetchFromRaynet();
    return NextResponse.json(companies, {
      headers: { "X-Data-Source": source },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Raynet fetch failed, using mock:", msg);
    return NextResponse.json(MOCK_COMPANIES, {
      headers: { "X-Data-Source": "mock-fallback", "X-Error": msg.slice(0, 200) },
    });
  }
}
