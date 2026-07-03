import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching recent webhooks from database...\n");

  const webhooks = await prisma.webhookLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (webhooks.length === 0) {
    console.log("No webhooks logged yet. Need to send an email and open it.");
    return;
  }

  console.log(`Found ${webhooks.length} webhooks:\n`);

  webhooks.forEach((webhook, i) => {
    console.log(`\n=== Webhook ${i + 1} ===`);
    console.log("Raw Body:", JSON.stringify(webhook.rawBody, null, 2));
    console.log("Created:", webhook.createdAt);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
