import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function checkSchema() {
  console.log("\nJOBS TABLE SCHEMA:\n");
  
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position
  `;
  
  (columns as any[]).forEach(col => {
    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
    console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
  });
  
  console.log("\nPRIMARY KEY CONSTRAINT:\n");
  const pk = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.key_column_usage
    WHERE table_name = 'jobs' AND constraint_name LIKE '%jobs_pkey%'
  `;
  (pk as any[]).forEach(col => console.log(`  ${col.column_name}`));
  
  await prisma.$disconnect();
}

checkSchema().catch(console.error);
