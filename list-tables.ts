import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTables() {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  ` as any[];

  console.log('TABLES IN CHILD BRANCH DATABASE (brotherjimi):');
  console.log('='.repeat(60));
  tables.forEach((t: any) => console.log(`  • ${t.table_name}`));
  console.log('='.repeat(60));
  console.log(`Total: ${tables.length} tables\n`);

  await prisma.$disconnect();
}

listTables();
