const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const RETENTION_DAYS = 14;
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || "./backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function runBackup() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .replace(/\..+/, "");
  
  const fileName = `cedex-backup-${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);

  console.log("[BACKUP START] Exporting database snapshot via Prisma...");

  try {
    // Explicit model list matching Prisma schema
    const models = [
      "user",
      "merchant",
      "driver",
      "parcel",
      "driverSettlement",
      "merchantPayout"
    ];

    const data = {};
    const counts = {};

    for (const model of models) {
      if (typeof prisma[model]?.findMany === "function") {
        const records = await prisma[model].findMany();
        data[model] = records;
        counts[model] = records.length;
      }
    }

    const backupPayload = {
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        platform: "Cedex Logistics Portal",
        counts,
      },
      data,
    };

    fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2), "utf8");

    const stats = fs.statSync(filePath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    console.log(`[BACKUP COMPLETED] Saved to: ${filePath} (${sizeKb} KB)`);
    console.log(
      `[SUMMARY] Users: ${counts.user || 0} | Merchants: ${counts.merchant || 0} | Drivers: ${counts.driver || 0} | Parcels: ${counts.parcel || 0} | Payouts: ${counts.merchantPayout || 0} | Settlements: ${counts.driverSettlement || 0}`
    );

    pruneOldBackups();
  } catch (error) {
    console.error("[BACKUP ERROR]:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

function pruneOldBackups() {
  const now = Date.now();
  const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      if (!file.startsWith("cedex-backup-")) return;
      const fullPath = path.join(BACKUP_DIR, file);
      try {
        const stat = fs.statSync(fullPath);
        if (now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          console.log(`[PRUNED] Removed old archive: ${file}`);
        }
      } catch {}
    });
  });
}

runBackup();
