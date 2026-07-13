import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTracking() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCampaigns = await prisma.b2bCampaign.findMany({
      where: { sentAt: { gte: today } },
      include: { _count: { select: { emails: true } } }
    });

    console.log(`\n[TRACKING CHECK] Campaigns created today: ${todayCampaigns.length}`);
    todayCampaigns.forEach((c: any, i: number) => {
      console.log(`  Campaign ${i+1}: ${c._count.emails} email records`);
    });

    const emailsToday = await prisma.b2bCampaignEmail.count({
      where: { emailSentAt: { gte: today } }
    });
    
    const statuses = await prisma.b2bCampaignEmail.groupBy({
      by: ['status'],
      where: { emailSentAt: { gte: today } },
      _count: true
    });

    console.log(`\n[TRACKING CHECK] Total email records today: ${emailsToday}`);
    statuses.forEach((s: any) => {
      console.log(`  Status "${s.status}": ${s._count}`);
    });

    const emailDuplicates = await prisma.b2bCampaignEmail.groupBy({
      by: ['prospectEmail'],
      where: { emailSentAt: { gte: today } },
      _count: true,
      having: { prospectEmail: { _count: { gt: 1 } } }
    });

    if (emailDuplicates.length > 0) {
      console.log(`\n[TRACKING CHECK] Duplicate sends (same email, multiple campaigns):`);
      emailDuplicates.forEach((dup: any) => {
        console.log(`  ${dup.prospectEmail}: ${dup._count} times`);
      });
    }

  } finally {
    await prisma.$disconnect();
  }
}

checkTracking().catch(console.error);
