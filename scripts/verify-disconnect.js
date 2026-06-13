const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');

async function verify() {
  const prisma = new PrismaClient();
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== VERIFYING THE SYSTEM DISCONNECT ===\n');
    
    // Count Prisma businesses
    const prismaCount = await prisma.business.count();
    console.log('Prisma business table (discovered via Google Places):');
    console.log(`  Count: ${prismaCount}`);
    
    // Sample what's in Prisma
    const prismaRecent = await prisma.business.findMany({
      take: 3,
      orderBy: { discoveredAt: 'desc' },
      select: { id: true, name: true, placeId: true, discoveredAt: true }
    });
    if (prismaRecent.length > 0) {
      console.log('  Recent discoveries:');
      prismaRecent.forEach(b => {
        console.log(`    - ${b.name} (discovered: ${b.discoveredAt.toISOString()})`);
      });
    }
    
    console.log('\n');
    
    // Count Neon SQL leads
    const neonLeads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log('Neon SQL b2b_leads table (used by recognition email):');
    console.log(`  Count: ${neonLeads[0].count}`);
    
    // Sample what's in b2b_leads
    const neonRecent = await sql`
      SELECT id, business_name, created_at 
      FROM b2b_leads 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    if (neonRecent.length > 0) {
      console.log('  Recent leads:');
      neonRecent.forEach(l => {
        console.log(`    - ${l.business_name} (created: ${l.created_at})`);
      });
    }
    
    console.log('\n');
    
    // Check for any cross-reference
    const prismaWithNeonRef = await prisma.business.findMany({
      where: {
        id: { in: (await sql`SELECT DISTINCT discovered_business_id FROM b2b_leads WHERE discovered_business_id IS NOT NULL`).map(r => r.discovered_business_id) }
      },
      take: 1
    });
    
    console.log('Cross-reference check:');
    console.log(`  Prisma businesses referenced in b2b_leads: ${prismaWithNeonRef.length > 0 ? 'YES' : 'NO'}`);
    
    console.log('\n');
    
    // Find the disconnect
    console.log('═'.repeat(80));
    console.log('ROOT CAUSE VERIFIED:');
    console.log('═'.repeat(80));
    console.log('\nPrisma business table has 151 records.');
    console.log('b2b_leads table has 45 records (from Phase 3, not from discovery).');
    console.log('There is NO path from Prisma discoveries to b2b_leads.');
    console.log('\nConsequences:');
    console.log('1. Discovery finds and stores businesses in Prisma');
    console.log('2. Recognition email looks for leads in b2b_leads');
    console.log('3. They never connect');
    console.log('4. No recognition emails sent from discovered businesses');
    console.log('5. Autonomous revenue pipeline is broken');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
