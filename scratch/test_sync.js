import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.trade.findUnique({ where: { id: 'cmthh5llo0001uybs41x3pa6a' } });
  console.log(t);
}

main().catch(console.error).finally(() => prisma.$disconnect());
