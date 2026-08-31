import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.trade.updateMany({
    where: {
      isArchived: true,
      status: { not: "DELETED" },
    },
    data: {
      status: "DELETED",
    },
  });
  console.log(`Updated ${updated.count} trades to DELETED status.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
