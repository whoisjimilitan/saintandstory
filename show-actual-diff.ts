import { PrismaClient } from '@prisma/client';

async function showActualDiff() {
  console.log('\n' + '='.repeat(90));
  console.log('PRODUCTION DATABASE ANALYSIS');
  console.log('='.repeat(90));

  const prodDBUrl = 'postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  // Create Prisma client for production
  const prod = new PrismaClient({
    datasources: {
      db: {
        url: prodDBUrl,
      },
    },
  });

  try {
    // Get all tables from production database
    const prodTables = await prod.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as Array<{ table_name: string }>;

    console.log('\n📊 CURRENT TABLES IN PRODUCTION (neondb):');
    console.log('-'.repeat(90));
    prodTables.forEach(t => console.log(`  • ${t.table_name}`));
    console.log(`\nTotal: ${prodTables.length} tables`);

    // Get all columns for key tables
    console.log('\n' + '='.repeat(90));
    console.log('CURRENT COLUMNS IN PRODUCTION JOBS TABLE');
    console.log('='.repeat(90));

    const jobsColumns = await prod.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position
    ` as Array<{ column_name: string; data_type: string; is_nullable: string }>;

    if (jobsColumns.length > 0) {
      console.log('\n✅ Jobs table exists in production with columns:');
      jobsColumns.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[NULLABLE]' : '[NOT NULL]'}`);
      });
    } else {
      console.log('\n❌ Jobs table DOES NOT EXIST in production');
    }

    // Check for critical columns
    const hasLocationSharingSince = jobsColumns.some(c => c.column_name === 'location_sharing_since');
    console.log(`\n  Location Sharing Since Column: ${hasLocationSharingSince ? '✅ EXISTS' : '❌ MISSING'}`);

    console.log('\n' + '='.repeat(90));
    console.log('CURRENT COLUMNS IN PRODUCTION DRIVER_LOCATION_HISTORY TABLE');
    console.log('='.repeat(90));

    const dlhColumns = await prod.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'driver_location_history'
      ORDER BY ordinal_position
    ` as Array<{ column_name: string; data_type: string; is_nullable: string }>;

    if (dlhColumns.length > 0) {
      console.log('\n✅ Driver Location History table exists in production with columns:');
      dlhColumns.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[NULLABLE]' : '[NOT NULL]'}`);
      });
    } else {
      console.log('\n❌ Driver Location History table DOES NOT EXIST in production');
    }

    // Check for timestamp column
    const hasRecordedAt = dlhColumns.some(c => c.column_name === 'recorded_at');
    const hasCreatedAt = dlhColumns.some(c => c.column_name === 'created_at');
    console.log(`\n  Recorded At Column: ${hasRecordedAt ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  Created At Column: ${hasCreatedAt ? '⚠️  EXISTS (will be renamed)' : '✅ NOT PRESENT (good)'}`);

  } catch (error: any) {
    console.error('\n❌ ERROR accessing production database:', error.message);
  } finally {
    await prod.$disconnect();
  }

  // NOW SHOW EXPECTED SCHEMA
  console.log('\n' + '='.repeat(90));
  console.log('EXPECTED SCHEMA FROM PRISMA (Commit 6746278)');
  console.log('='.repeat(90));

  console.log('\nDISPATCH PLATFORM TABLES (should be created/updated):');
  console.log('  1. drivers (17 columns)');
  console.log('  2. driver_availability (5 columns)');
  console.log('  3. jobs (32 columns) ← ADD location_sharing_since');
  console.log('  4. ratings (6 columns)');
  console.log('  5. earnings (8 columns)');
  console.log('  6. driver_location_history (8 columns) ← RENAME created_at to recorded_at');

  console.log('\nDISCOVERY SYSTEM TABLES (should remain unchanged):');
  console.log('  7. "Assumption"');
  console.log('  8. "Business"');
  console.log('  9. "Conversation"');
  console.log('  10. "EvidencePattern"');
  console.log('  11. "Hypothesis"');
  console.log('  12. "ObservationEvent"');
  console.log('  13. "Outcome"');
  console.log('  14. "Review"');

  console.log('\n' + '='.repeat(90));
  console.log('WHAT WILL CHANGE (Predicted)');
  console.log('='.repeat(90));

  console.log(`
If these tables DO NOT exist in production:
  ✅ All 6 dispatch tables WILL BE CREATED
  ✅ All 8 discovery tables WILL BE CREATED
  ✅ No data loss (new database)

If driver_location_history exists with 'created_at':
  ⚠️  Column WILL BE RENAMED from created_at → recorded_at
  ✅ Existing data preserved
  ✅ No data loss

If jobs table exists WITHOUT location_sharing_since:
  ✅ Column WILL BE ADDED
  ✅ NULL for existing rows
  ✅ No data loss

DROPPED TABLES:
  • Subscriber (orphaned, 4 unused rows - NOT IN NEW SCHEMA)
`);
}

showActualDiff().catch(console.error);
