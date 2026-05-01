import { NextRequest, NextResponse } from "next/server";
import { getUser, unauthorized } from "@/lib/auth";
import type { RaynetCompany } from "@/types";

// GET /api/companies — fetches active companies from Raynet CRM
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const apiUser = process.env.RAYNET_API_USER?.trim();
  const apiKey = process.env.RAYNET_API_KEY?.trim();
  const instanceName = process.env.RAYNET_INSTANCE_NAME?.trim();

  if (!apiUser || !apiKey || !instanceName) {
    return NextResponse.json(
      { error: "Raynet credentials not configured" },
      { status: 500 }
    );
  }

  const companies: RaynetCompany[] = [];
  const limit = 200;
  const excludedOwners = new Set(["Import Import", "RAYNET CRM"]);
  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
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
      return NextResponse.json(
        { error: `Raynet API ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }
    const json = await res.json();
    totalCount = json.totalCount ?? 0;

    if (json.data?.length) {
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

    offset += limit;
  }

  return NextResponse.json(companies);
}
