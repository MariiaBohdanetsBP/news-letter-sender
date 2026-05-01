import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const users = [
    { username: "admin", password: "Nw$L3tt3r!Adm1n", displayName: "Administrátor", role: "Admin" as const },
    { username: "manager", password: "Nw$L3tt3r!Mgr42", displayName: "Account Manager", role: "AccountManager" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        passwordHash: bcrypt.hashSync(u.password, 10),
        displayName: u.displayName,
        role: u.role,
      },
    });
  }

  // Create a sample campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Newsletter Květen 2026",
      status: "Processed",
      planDate: new Date("2026-05-15"),
    },
  });

  console.log(`✅ Created ${users.length} users and campaign '${campaign.name}'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
