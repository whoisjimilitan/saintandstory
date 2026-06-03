import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function generateActualDiff() {
  console.log('\n' + '='.repeat(90));
  console.log('ACTUAL SCHEMA DIFF ANALYSIS');
  console.log('='.repeat(90));

  // PRODUCTION DATABASE
  console.log('\n' + '='.repeat(90));
  console.log('INTROSPECTING PRODUCTION DATABASE (neondb)');
  console.log('='.repeat(90));

  const prodDBUrl = 'postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  try {
    const { stdout } = await execPromise(
      `DATABASE_URL="${prodDBUrl}" npx prisma db pull --skip-generate`,
      { maxBuffer: 10 * 1024 * 1024, cwd: '/Users/jimilitan/Documents/GitHub/saintandstory' }
    );
    console.log('✅ Production database introspection output:');
    console.log(stdout);
  } catch (error: any) {
    console.log('Output:', error.stdout);
    console.log('Error (may be expected):', error.stderr);
  }

  // CHILD DATABASE
  console.log('\n' + '='.repeat(90));
  console.log('INTROSPECTING CHILD BRANCH DATABASE (brotherjimi)');
  console.log('='.repeat(90));

  const childDBUrl = 'postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-bold-boat-abmhqvxq-pooler.eu-west-2.aws.neon.tech/brotherjimi?sslmode=require&channel_binding=require';

  try {
    const { stdout } = await execPromise(
      `DATABASE_URL="${childDBUrl}" npx prisma db pull --skip-generate`,
      { maxBuffer: 10 * 1024 * 1024, cwd: '/Users/jimilitan/Documents/GitHub/saintandstory' }
    );
    console.log('✅ Child branch database introspection output:');
    console.log(stdout);
  } catch (error: any) {
    console.log('Output:', error.stdout);
    console.log('Error (may be expected):', error.stderr);
  }

  console.log('\n' + '='.repeat(90));
  console.log('PRISMA DB PUSH DRY RUN - PRODUCTION');
  console.log('='.repeat(90));

  try {
    const { stdout, stderr } = await execPromise(
      `DATABASE_URL="${prodDBUrl}" npx prisma migrate dev --name "preview-diff" --skip-execute --skip-generate || true`,
      { maxBuffer: 10 * 1024 * 1024, cwd: '/Users/jimilitan/Documents/GitHub/saintandstory' }
    );
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
  } catch (error: any) {
    console.log('Output:', error.stdout);
    console.log('Error:', error.stderr);
  }
}

generateActualDiff().catch(console.error);
