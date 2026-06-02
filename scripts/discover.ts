import { runDiscoveryPipeline } from "../lib/discovery/pipeline";

async function main() {
  const args = process.argv.slice(2);

  function getArg(name: string): string | undefined {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const niche = getArg("--niche");
  const location = getArg("--location");

  if (!niche || !location) {
    console.error(
      "Usage: npm run discover -- --niche <niche> --location <location>"
    );
    process.exit(1);
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error(
      "ERROR: GOOGLE_MAPS_API_KEY is not set. Add it to .env.local"
    );
    process.exit(1);
  }

  console.log("\nSaint & Story — B2B Lead Discovery");
  console.log(`Niche: ${niche}  |  Location: ${location}`);
  console.log("─".repeat(60));

  const result = await runDiscoveryPipeline({ niche, location });

  console.log("\n─".repeat(60));
  console.log("Pipeline complete:");
  console.log(`  Discovered:          ${result.discovered}`);
  console.log(`  Stored (new):        ${result.stored}`);
  console.log(`  Skipped (existing):  ${result.skipped}`);
  console.log(`  Evidence collected:  ${result.evidenceCollected}`);
  console.log(`  Hypotheses created:  ${result.hypothesesCreated}`);
  console.log(`  Questions created:   ${result.questionsCreated}`);
  console.log(`  Inbox ready:         ${result.inboxReady}`);
  console.log("");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
