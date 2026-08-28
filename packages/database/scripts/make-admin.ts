import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address as the first argument.');
    console.error('Usage: npx tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`Successfully upgraded ${user.name} (${user.email}) to ADMIN role!`);
  } catch (error) {
    console.error(`Failed to update user. Are you sure a user with email "${email}" exists?`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
