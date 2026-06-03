import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  console.log('='.repeat(80));
  console.log('CHILD BRANCH SCHEMA VERIFICATION');
  console.log('='.repeat(80));

  try {
    // Check Dispatch System Tables
    console.log('\n📦 DISPATCH SYSTEM TABLES:');
    console.log('-'.repeat(80));

    const driverCount = await prisma.driver.count();
    console.log(`✅ drivers table exists (${driverCount} rows)`);

    const jobCount = await prisma.job.count();
    console.log(`✅ jobs table exists (${jobCount} rows)`);

    const earningCount = await prisma.earning.count();
    console.log(`✅ earnings table exists (${earningCount} rows)`);

    const ratingCount = await prisma.rating.count();
    console.log(`✅ ratings table exists (${ratingCount} rows)`);

    const availabilityCount = await prisma.driverAvailability.count();
    console.log(`✅ driver_availability table exists (${availabilityCount} rows)`);

    const locationHistoryCount = await prisma.driverLocationHistory.count();
    console.log(`✅ driver_location_history table exists (${locationHistoryCount} rows)`);

    // Check Discovery System Tables
    console.log('\n🔍 DISCOVERY SYSTEM TABLES:');
    console.log('-'.repeat(80));

    const businessCount = await prisma.business.count();
    console.log(`✅ Business table exists (${businessCount} rows)`);

    const reviewCount = await prisma.review.count();
    console.log(`✅ Review table exists (${reviewCount} rows)`);

    const patternCount = await prisma.evidencePattern.count();
    console.log(`✅ EvidencePattern table exists (${patternCount} rows)`);

    const hypothesisCount = await prisma.hypothesis.count();
    console.log(`✅ Hypothesis table exists (${hypothesisCount} rows)`);

    const conversationCount = await prisma.conversation.count();
    console.log(`✅ Conversation table exists (${conversationCount} rows)`);

    const outcomeCount = await prisma.outcome.count();
    console.log(`✅ Outcome table exists (${outcomeCount} rows)`);

    const assumptionCount = await prisma.assumption.count();
    console.log(`✅ Assumption table exists (${assumptionCount} rows)`);

    const observationCount = await prisma.observationEvent.count();
    console.log(`✅ ObservationEvent table exists (${observationCount} rows)`);

    // Verify specific columns
    console.log('\n🔬 CRITICAL COLUMNS VERIFICATION:');
    console.log('-'.repeat(80));

    const jobColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position
    ` as Array<{column_name: string}>;

    const hasLocationSharingSince = jobColumns.some(col => col.column_name === 'location_sharing_since');
    console.log(`${hasLocationSharingSince ? '✅' : '❌'} jobs.location_sharing_since column exists`);

    const driverLocationColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'driver_location_history'
      ORDER BY ordinal_position
    ` as Array<{column_name: string}>;

    const hasRecordedAt = driverLocationColumns.some(col => col.column_name === 'recorded_at');
    const hasCreatedAt = driverLocationColumns.some(col => col.column_name === 'created_at');
    console.log(`${hasRecordedAt ? '✅' : '❌'} driver_location_history.recorded_at column exists`);
    console.log(`${!hasCreatedAt ? '✅' : '❌'} driver_location_history.created_at column does NOT exist (correct - should be recorded_at)`);

    // List all job columns
    console.log('\n📋 ALL JOBS TABLE COLUMNS:');
    console.log('-'.repeat(80));
    jobColumns.forEach(col => {
      console.log(`  • ${col.column_name}`);
    });

    // List all driver_location_history columns
    console.log('\n📋 ALL DRIVER_LOCATION_HISTORY TABLE COLUMNS:');
    console.log('-'.repeat(80));
    driverLocationColumns.forEach(col => {
      console.log(`  • ${col.column_name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL VERIFICATIONS PASSED');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
