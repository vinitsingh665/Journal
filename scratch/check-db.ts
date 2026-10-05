import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trades = await prisma.trade.findMany({
    where: { symbol: "CUPID" },
    include: { events: true }
  });
  console.log(JSON.stringify(trades, null, 2));
}

main();
