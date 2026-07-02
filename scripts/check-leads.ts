import { prisma } from '../lib/prisma';

async function main() {
  console.log('Checking leads in database...\n');
  
  const leads = await prisma.b2bLead.findMany({
    select: {
      id: true,
      businessName: true,
      email: true,
      city: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  console.log(`Found ${leads.length} leads:\n`);
  leads.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.businessName} (${lead.city}) - ${lead.email || 'no email'}`);
  });

  // Try searching for kL INT
  console.log('\n--- Search for "kL INT" ---');
  const search = await prisma.b2bLead.findMany({
    where: {
      OR: [
        { businessName: { contains: 'kL INT', mode: 'insensitive' } },
        { email: { contains: 'kL INT', mode: 'insensitive' } },
      ]
    },
  });
  console.log(`Results: ${search.length}`);
  search.forEach(lead => {
    console.log(`  - ${lead.businessName}`);
  });
}

main().catch(console.error);
