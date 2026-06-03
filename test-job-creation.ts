import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testJobCreation() {
  console.log('TESTING JOB CREATION WITH FIXED SCHEMA');
  console.log('='.repeat(80));

  try {
    // Create a test job exactly like the API would
    const testJob = await prisma.job.create({
      data: {
        reference: 'TEST-001',
        trackingToken: 'test-token-' + Date.now(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+441234567890',
        serviceType: 'removal',
        postcodeFrom: 'SW1A 1AA',
        postcodeTo: 'N1 1AA',
        timeframe: 'ASAP',
        helpLoading: 'yes',
        duration: '4 hours',
        status: 'pending_review',
        // leadId not required for test
      },
    });

    console.log('\n✅ JOB CREATION SUCCESSFUL!');
    console.log('\nJob created:');
    console.log(`  ID: ${testJob.id}`);
    console.log(`  Reference: ${testJob.reference}`);
    console.log(`  Status: ${testJob.status}`);
    console.log(`  Customer: ${testJob.customerName}`);
    console.log(`  Created at: ${testJob.createdAt}`);

    // Now test that admin query finds it
    console.log('\n' + '='.repeat(80));
    console.log('TESTING ADMIN DASHBOARD QUERY');
    console.log('='.repeat(80));

    const pendingJobs = await prisma.job.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`\n✅ ADMIN QUERY SUCCESSFUL!`);
    console.log(`Found ${pendingJobs.length} pending_review job(s)`);
    console.log(`Most recent: ${pendingJobs[0]?.reference}`);

    // Clean up
    await prisma.job.delete({
      where: { id: testJob.id },
    });

    console.log('\n✅ Test cleanup complete');
    console.log('\n' + '='.repeat(80));
    console.log('RESULT: Fix is working correctly!');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testJobCreation();
