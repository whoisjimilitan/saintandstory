import { config } from "dotenv";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

async function checkLogs() {
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  
  if (!vercelToken || !projectId) {
    console.log("❌ Missing VERCEL_TOKEN or VERCEL_PROJECT_ID in .env.local");
    return;
  }
  
  console.log("Fetching recent logs from Vercel...\n");
  
  // Get logs from the last 5 minutes
  const since = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);
  
  const response = await fetch(
    `https://api.vercel.com/v2/deployments?projectId=${projectId}&limit=1`,
    {
      headers: { Authorization: `Bearer ${vercelToken}` },
    }
  );
  
  if (!response.ok) {
    console.log("❌ Failed to fetch from Vercel API:", response.status);
    return;
  }
  
  const deployments = await response.json() as any;
  console.log("Latest deployment:", deployments.deployments?.[0]?.uid);
}

checkLogs().catch(console.error);
