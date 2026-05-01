import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, unauthorized } from "@/lib/auth";

// GET /api/contacts — list uploaded contacts
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return unauthorized();

  const contacts = await prisma.contact.findMany({
    orderBy: { companyName: "asc" },
  });

  return NextResponse.json({
    count: contacts.length,
    contacts: contacts.map((c) => ({
      companyId: c.companyId,
      companyName: c.companyName,
      email: c.email,
      contactName: c.contactName,
    })),
  });
}
