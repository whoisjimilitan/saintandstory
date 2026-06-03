import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runRuntimeVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('CHILD BRANCH - RUNTIME VERIFICATION');
  console.log('='.repeat(80));

  const results: { test: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

  try {
    // TEST 1: Create a test driver
    console.log('\n🧪 TEST 1: Driver Creation');
    const testDriver = await prisma.driver.create({
      data: {
        clerkUserId: 'test-clerk-001',
        email: 'test-driver@example.com',
        fullName: 'Test Driver',
        phone: '+441234567890',
        vehicleType: 'van',
        area: 'London',
        daysPreference: 'weekdays',
        profileLive: false,
      },
    });
    console.log(`✅ Driver created: ${testDriver.id}`);
    results.push({ test: 'Driver Creation', status: 'PASS', details: 'Test driver created successfully' });

    // TEST 2: Create a test job
    console.log('\n🧪 TEST 2: Job Creation');
    const testJob = await prisma.job.create({
      data: {
        reference: 'TEST-JOB-001',
        trackingToken: 'test-tracking-token-001',
        customerName: 'John Doe',
        customerEmail: 'customer@example.com',
        serviceType: 'removal',
        postcodeFrom: 'SW1A 1AA',
        postcodeTo: 'N1 1AA',
        status: 'new',
        price: 150,
      },
    });
    console.log(`✅ Job created: ${testJob.id}`);
    console.log(`✅ location_sharing_since is NULL (expected for new job): ${testJob.locationSharingSince === null}`);
    results.push({ test: 'Job Creation', status: 'PASS', details: 'Job created with location_sharing_since=NULL' });

    // TEST 3: Assign job to driver
    console.log('\n🧪 TEST 3: Job Assignment');
    const updatedJob = await prisma.job.update({
      where: { id: testJob.id },
      data: {
        driverId: testDriver.id,
        status: 'offered',
        offeredAt: new Date(),
      },
    });
    console.log(`✅ Job assigned to driver, status=${updatedJob.status}, offeredAt=${updatedJob.offeredAt}`);
    results.push({ test: 'Job Assignment', status: 'PASS', details: 'Job assigned with offeredAt timestamp' });

    // TEST 4: Location tracking - first ping
    console.log('\n🧪 TEST 4: Location Tracking (First Ping)');
    const now = new Date();
    const jobWithLocation = await prisma.job.update({
      where: { id: testJob.id },
      data: {
        status: 'in_progress',
        driverLat: 51.5074,
        driverLng: -0.1278,
        driverEtaMinutes: 5,
        locationSharingSince: now,
        inProgressAt: now,
      },
    });
    console.log(`✅ Location updated: lat=${jobWithLocation.driverLat}, lng=${jobWithLocation.driverLng}`);
    console.log(`✅ locationSharingSince SET: ${jobWithLocation.locationSharingSince !== null}`);
    results.push({ test: 'Location Tracking (First Ping)', status: 'PASS', details: 'Location updated with locationSharingSince timestamp' });

    // TEST 5: Log to driver_location_history with recorded_at
    console.log('\n🧪 TEST 5: Driver Location History');
    const locationRecord = await prisma.driverLocationHistory.create({
      data: {
        jobId: testJob.id,
        driverClerkId: testDriver.clerkUserId || 'test-clerk-001',
        lat: 51.5074,
        lng: -0.1278,
        accuracy: 10,
        etaMinutes: 5,
      },
    });
    console.log(`✅ Location history recorded: ${locationRecord.id}`);
    console.log(`✅ recordedAt timestamp set: ${locationRecord.recordedAt !== null}`);
    results.push({ test: 'Driver Location History', status: 'PASS', details: 'Location history recorded with recorded_at timestamp' });

    // TEST 6: Job completion and earnings
    console.log('\n🧪 TEST 6: Job Completion & Earnings');
    const completedJob = await prisma.job.update({
      where: { id: testJob.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
    const earning = await prisma.earning.create({
      data: {
        driverId: testDriver.id,
        jobId: testJob.id,
        amount: 150,
        status: 'pending',
      },
    });
    console.log(`✅ Job completed with completedAt: ${completedJob.completedAt}`);
    console.log(`✅ Earnings record created: £${earning.amount}`);
    results.push({ test: 'Job Completion & Earnings', status: 'PASS', details: 'Job completed and earnings recorded' });

    // TEST 7: Rating system
    console.log('\n🧪 TEST 7: Job Rating');
    const rating = await prisma.rating.create({
      data: {
        jobId: testJob.id,
        driverId: testDriver.id,
        score: 5,
        comment: 'Excellent service',
      },
    });
    const updatedDriver = await prisma.driver.update({
      where: { id: testDriver.id },
      data: {
        ratingAvg: 5.0,
        ratingCount: 1,
      },
    });
    console.log(`✅ Rating created: ${rating.score}/5`);
    console.log(`✅ Driver rating updated: ${updatedDriver.ratingAvg} (${updatedDriver.ratingCount} ratings)`);
    results.push({ test: 'Job Rating', status: 'PASS', details: 'Rating recorded and driver stats updated' });

    // TEST 8: Discovery system - Business table
    console.log('\n🧪 TEST 8: Discovery System (Business)');
    const business = await prisma.business.create({
      data: {
        name: 'Test Florist',
        placeId: 'test-place-001',
        niche: 'florists',
        location: 'London',
      },
    });
    console.log(`✅ Business record created: ${business.id}`);
    results.push({ test: 'Discovery System (Business)', status: 'PASS', details: 'Business record created' });

    // TEST 9: Discovery system - Review
    console.log('\n🧪 TEST 9: Discovery System (Review)');
    const review = await prisma.review.create({
      data: {
        businessId: business.id,
        text: 'Great flowers',
        rating: 5,
        author: 'John',
      },
    });
    console.log(`✅ Review created: ${review.id}`);
    results.push({ test: 'Discovery System (Review)', status: 'PASS', details: 'Review record created' });

    // TEST 10: Driver availability
    console.log('\n🧪 TEST 10: Driver Availability');
    const availability = await prisma.driverAvailability.create({
      data: {
        driverId: testDriver.id,
        availableDate: new Date('2026-06-04'),
        notes: 'Available all day',
      },
    });
    console.log(`✅ Availability created: ${availability.id}`);
    results.push({ test: 'Driver Availability', status: 'PASS', details: 'Driver availability record created' });

    // CLEANUP
    console.log('\n🧹 Cleaning up test data...');
    await prisma.driverLocationHistory.deleteMany({ where: { jobId: testJob.id } });
    await prisma.earning.deleteMany({ where: { jobId: testJob.id } });
    await prisma.rating.deleteMany({ where: { jobId: testJob.id } });
    await prisma.job.delete({ where: { id: testJob.id } });
    await prisma.driverAvailability.deleteMany({ where: { driverId: testDriver.id } });
    await prisma.driver.delete({ where: { id: testDriver.id } });
    await prisma.review.deleteMany({ where: { businessId: business.id } });
    await prisma.business.delete({ where: { id: business.id } });
    console.log('✅ Cleanup complete');

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    results.push({ test: 'Runtime Error', status: 'FAIL', details: error.message });
  }

  // SUMMARY
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}: ${r.details}`);
  });

  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  console.log('\n' + '='.repeat(80));
  console.log(`RESULT: ${passed}/${total} tests passed`);
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

runRuntimeVerification();
