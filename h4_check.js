console.log('H4: Wrong Deployment Routing\n');

console.log('Deployment Aliases at Cron Time (02:00 UTC June 12):');
console.log('Active production deployment: saintandstory-kf5upz5gy-jimi2.vercel.app');
console.log('Created: 2026-06-11 17:24:54 UTC');
console.log('Status: Ready\n');

console.log('Domain Aliases Pointing to Production:');
const aliases = [
  'https://saintandstory.vercel.app',
  'https://saintandstoryltd.co.uk',
  'https://www.saintandstoryltd.co.uk',
  'https://saintandstory-jimi2.vercel.app',
  'https://saintandstory-git-main-jimi2.vercel.app'
];

aliases.forEach(alias => {
  console.log('  - ' + alias);
});

console.log('\nVercel Cron Target:');
console.log('Configuration in vercel.json: /api/orchestrate/b2b-daily');
console.log('Interpreted as: POST to default production domain\n');

console.log('Evidence FOR wrong deployment:');
console.log('- Could route to preview environment if branch different');
console.log('- Could route to old deployment if aliasing misconfigured\n');

console.log('Evidence AGAINST wrong deployment:');
console.log('- Deployment was marked "Ready" (production-ready)');
console.log('- Manual test hit same endpoint (saintandstory.vercel.app) successfully');
console.log('- All aliases point to same production deployment');
console.log('- Vercel cron always targets production for crons in vercel.json');
console.log('- If request went to different endpoint, it would hit GET (/api/orchestrate/b2b-daily health check)');
console.log('  and we would see it in logs (we don\'t)\n');

console.log('Confidence AGAINST wrong deployment: 98%');

