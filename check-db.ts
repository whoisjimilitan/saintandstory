import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    // Total records
    const total = await prisma.b2bCampaignEmail.count();
    console.log(`\n[DB] Total B2bCampaignEmail records: ${total}`);
    
    // Campaigns
    const campaigns = await prisma.b2bCampaign.findMany({
      include: { _count: { select: { emails: true } } },
      orderBy: { sentAt: 'desc' }
    });
    
    console.log(`\n[CAMPAIGNS] ${campaigns.length} campaigns:`);
    for (const c of campaigns) {
      console.log(`  Campaign ${c.id.slice(0, 8)}: totalLeads=${c.totalLeads}, actual=${c._count.emails}`);
    }
    
    // Duplicates
    const dups = await prisma.b2bCampaignEmail.groupBy({
      by: ['prospectEmail'],
      _count: true,
      having: { prospectEmail: { _count: { gt: 1 } } }
    });
    
    console.log(`\n[DUPLICATES] ${dups.length} emails sent multiple times:`);
    for (const d of dups) {
      console.log(`  ${d.prospectEmail}: ${d._count} times`);
    }
    
    // Statuses
    const statuses = await prisma.b2bCampaignEmail.groupBy({
      by: ['status'],
      _count: true
    });
    console.log(`\n[STATUS]`);
    for (const s of statuses) {
      console.log(`  ${s.status}: ${s._count}`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

check();
