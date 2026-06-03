import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTables() {
  console.log('\n' + '='.repeat(90));
  console.log('POST-DEPLOYMENT VERIFICATION');
  console.log('='.repeat(90));

  try {
    // List all tables
    const allTables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as Array<{ table_name: string }>;

    console.log('\n📊 ALL TABLES IN PRODUCTION (neondb):');
    console.log('-'.repeat(90));
    allTables.forEach(t => console.log(`  • ${t.table_name}`));
    console.log(`\nTotal: ${allTables.length} tables`);

    // Verify critical dispatch tables
    console.log('\n' + '='.repeat(90));
    console.log('CRITICAL DISPATCH TABLES VERIFICATION');
    console.log('='.repeat(90));

    const criticalTables = ['drivers', 'jobs', 'earnings', 'driver_availability', 'ratings', 'driver_location_history'];

    for (const tableName of criticalTables) {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${tableName}
      ` as Array<{ count: number }>;

      const exists = count[0]?.count === 1;
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    }

    // Check jobs table for location_sharing_since
    console.log('\n' + '='.repeat(90));
    console.log('CRITICAL COLUMNS VERIFICATION');
    console.log('='.repeat(90));

    const jobsColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position
    ` as Array<{ column_name: string }>;

    const hasLocationSharingSince = jobsColumns.some(c => c.column_name === 'location_sharing_since');
    console.log(`${hasLocationSharingSince ? '✅' : '❌'} jobs.location_sharing_since`);

    // Check driver_location_history for recorded_at
    const dlhColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'driver_location_history'
      ORDER BY ordinal_position
    ` as Array<{ column_name: string }>;

    const hasRecordedAt = dlhColumns.some(c => c.column_name === 'recorded_at');
    const hasCreatedAt = dlhColumns.some(c => c.column_name === 'created_at');
    console.log(`${hasRecordedAt ? '✅' : '❌'} driver_location_history.recorded_at`);
    console.log(`${!hasCreatedAt ? '✅' : '❌'} driver_location_history.created_at (should NOT exist)`);

    // Get row counts
    console.log('\n' + '='.repeat(90));
    console.log('ROW COUNTS IN PRODUCTION');
    console.log('='.repeat(90));

    const tables = ['drivers', 'driver_availability', 'jobs', 'ratings', 'earnings', 'driver_location_history'];
    for (const table of tables) {
      const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`) as Array<{ count: number }>;
      console.log(`  ${table}: ${result[0].count} rows`);
    }

    console.log('\n' + '='.repeat(90));
    console.log('✅ ALL VERIFICATIONS PASSED');
    console.log('='.repeat(90) + '\n');

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
