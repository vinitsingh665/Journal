import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const MISTAKE_TAGS = [
  { name: "Chased entry", description: "Entered at a price far from planned entry", color: "#EF4444" },
  { name: "Entered late", description: "Entered after the ideal trigger point", color: "#F97316" },
  { name: "FOMO", description: "Fear of missing out drove the entry", color: "#EAB308" },
  { name: "Moved stop loss", description: "Adjusted stop loss against the trade plan", color: "#EF4444" },
  { name: "Took profit early", description: "Exited before target was reached", color: "#F59E0B" },
  { name: "Oversized position", description: "Position size exceeded risk rules", color: "#DC2626" },
  { name: "Revenge trade", description: "Traded to recover a loss emotionally", color: "#B91C1C" },
  { name: "Overtrading", description: "Too many trades in a session", color: "#D97706" },
  { name: "Ignored market condition", description: "Traded against the prevailing market trend", color: "#9333EA" },
  { name: "Weak setup", description: "Setup did not meet all criteria", color: "#7C3AED" },
  { name: "Poor R:R", description: "Risk-to-reward ratio was unfavorable", color: "#6366F1" },
  { name: "Broke trading plan", description: "Deviated from the predefined trading plan", color: "#DC2626" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create mistake tags
  for (const tag of MISTAKE_TAGS) {
    await prisma.mistakeTag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }
  console.log(`✅ Created ${MISTAKE_TAGS.length} mistake tags`);

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
