import { generateEmailV4 } from './lib/email-engine-v4';

// Test with explicit solicitor business name
const prospect = {
  id: 'test-1',
  businessName: 'Wilson Solicitors',
  city: 'London',
  email: 'contact@wilson.com',
  firstName: 'James',
};

const email = generateEmailV4(prospect, 'James');

console.log('\n═══ PERFECT TEMPLATE TEST (SOLICITOR) ═══\n');
console.log('Subject:', email.subjectLine);
console.log('\n--- BODY ---\n');
console.log(email.bodyText);
