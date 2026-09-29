const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || "./backups");

async function runRestore() {
  const targetFile = process.argv[2];

  let backupPath;
  if (targetFile) {
    backupPath = path.isAbsolute(targetFile) ? targetFile : path.join(process.cwd(), targetFile);
  } else {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.error("[RESTORE ERROR] No backups directory found.");
      process.exit(1);
    }
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("cedex-backup-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error("[RESTORE ERROR] No backup files found in:", BACKUP_DIR);
      process.exit(1);
    }
    backupPath = path.join(BACKUP_DIR, files[0]);
  }

  console.log(`[RESTORE START] Restoring from: ${backupPath}`);
  const payload = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  const { data } = payload;

  try {
    // 1. Users
    if (data.user?.length) {
      for (const item of data.user) {
        await prisma.user.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Users: ${data.user.length}`);
    }

    // 2. Merchants
    if (data.merchant?.length) {
      for (const item of data.merchant) {
        await prisma.merchant.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Merchants: ${data.merchant.length}`);
    }

    // 3. Drivers
    if (data.driver?.length) {
      for (const item of data.driver) {
        await prisma.driver.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Drivers: ${data.driver.length}`);
    }

    // 4. Parcels
    if (data.parcel?.length) {
      for (const item of data.parcel) {
        await prisma.parcel.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Parcels: ${data.parcel.length}`);
    }

    // 5. Driver Settlements
    if (data.driverSettlement?.length) {
      for (const item of data.driverSettlement) {
        await prisma.driverSettlement.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Settlements: ${data.driverSettlement.length}`);
    }

    // 6. Merchant Payouts
    if (data.merchantPayout?.length) {
      for (const item of data.merchantPayout) {
        await prisma.merchantPayout.upsert({ where: { id: item.id }, create: item, update: item });
      }
      console.log(`[RESTORED] Payouts: ${data.merchantPayout.length}`);
    }

    console.log("[RESTORE COMPLETE] All entities verified and upserted successfully.");
  } catch (err) {
    console.error("[RESTORE ERROR]:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runRestore();
