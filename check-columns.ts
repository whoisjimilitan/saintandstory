import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColumns() {
  console.log('CHECKING JOBS TABLE COLUMNS');
  console.log('='.repeat(80));

  const columns = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position
  ` as any[];

  console.log('\nActual columns in jobs table:');
  columns.forEach((col: any) => {
    console.log(`  • ${col.column_name}`);
  });

  const hasAddressFrom = columns.some((c: any) => c.column_name === 'address_from');
  const hasAddressTo = columns.some((c: any) => c.column_name === 'address_to');

  console.log('\n' + '='.repeat(80));
  console.log('COLUMNS REFERENCED BY /api/leads ENDPOINT:');
  console.log('='.repeat(80));
  console.log(`  address_from: ${hasAddressFrom ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  address_to: ${hasAddressTo ? '✅ EXISTS' : '❌ MISSING'}`);

  if (!hasAddressFrom || !hasAddressTo) {
    console.log('\n🚨 ROOT CAUSE IDENTIFIED:');
    console.log('The /api/leads endpoint (line 30) tries to INSERT into:');
    console.log('  - address_from');
    console.log('  - address_to');
    console.log('\nBut these columns do NOT exist in the jobs table!');
    console.log('The schema only has: postcode_from, postcode_to');
    console.log('\nResult: INSERT fails silently, job is NEVER created in database');
    console.log('This is why submitted jobs do not appear on the admin dashboard.');
  }

  await prisma.$disconnect();
}

checkColumns();
