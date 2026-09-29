import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Password123!", 10);

  // 1. Merchant User + Profile
  const merchantUser = await prisma.user.upsert({
    where: { email: "merchant@demo.com" },
    update: {},
    create: {
      email: "merchant@demo.com",
      phone: "+96170111222",
      passwordHash: hash,
      name: "Tarek Beydoun",
      role: "MERCHANT",
      merchantProfile: {
        create: {
          companyName: "Cedar Commerce SAL",
          pickupAddress: "Hamra Main Street, Building 45",
          pickupCity: "Beirut",
          defaultNote: "Fragile retail items",
        },
      },
    },
    include: { merchantProfile: true },
  });

  // 2. Driver User + Profile
  const driverUser = await prisma.user.upsert({
    where: { email: "driver@demo.com" },
    update: {},
    create: {
      email: "driver@demo.com",
      phone: "+96171999888",
      passwordHash: hash,
      name: "Ahmad Kassir",
      role: "DRIVER",
      driverProfile: {
        create: {
          vehicleType: "Van / HiAce",
          plateNumber: "B 441029",
          isActive: true,
        },
      },
    },
    include: { driverProfile: true },
  });

  // 3. Admin User
  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      phone: "+96103000111",
      passwordHash: hash,
      name: "Hub Controller",
      role: "COURIER_ADMIN",
    },
  });

  console.log("Database seeded successfully!");
  console.log(`Merchant Profile ID: ${merchantUser.merchantProfile?.id}`);
  console.log(`Driver Profile ID:   ${driverUser.driverProfile?.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
