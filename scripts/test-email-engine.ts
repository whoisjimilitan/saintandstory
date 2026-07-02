import { generateEmailV4 } from '../lib/email-engine-v4';

const prospects = [
  { id: '1', businessName: 'Wilson Solicitors', city: 'London', firstName: 'Kike' },
  { id: '2', businessName: 'St Marys Restaurant', city: 'Manchester', firstName: 'Marcus' },
  { id: '3', businessName: 'Premier Process Servers Ltd', city: 'Birmingham', firstName: 'David' }
];

prospects.forEach(p => {
  const email = generateEmailV4(p);
  console.log(`\n=== ${p.businessName} (${p.firstName}) ===\n`);
  console.log(email.bodyText);
  console.log('\n---\n');
});
