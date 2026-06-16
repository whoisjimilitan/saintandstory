import { runDailyB2BOrchestration } from './lib/b2b-orchestrator';

async function test() {
  console.log('Running daily B2B orchestration...');
  const result = await runDailyB2BOrchestration();
  console.log('Orchestration result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
