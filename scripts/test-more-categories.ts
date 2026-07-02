import { generateEmailV4 } from '../lib/email-engine-v4';

const testCases = [
  { businessName: 'Central Hospital', firstName: 'Sarah' },
  { businessName: 'ABC Accounting Ltd', firstName: 'James' },
  { businessName: 'Greenfield Construction', firstName: 'Tom' },
  { businessName: 'Estate Agents Plus', firstName: 'Emma' },
  { businessName: 'Pharma Solutions Inc', firstName: 'Alex' }
];

testCases.forEach(tc => {
  const email = generateEmailV4({ id: Math.random().toString(), businessName: tc.businessName, firstName: tc.firstName });
  console.log(`\n✅ ${tc.businessName} (${tc.firstName})`);
  // Check if it has the dependency reveal (v8.4 marker)
  if (email.bodyText.includes('For many')) {
    console.log('   → ✓ Using v8.4 refined template (has dependency reveal)');
  } else {
    console.log('   → ✗ FALLBACK TO LEGACY TEMPLATE');
  }
});
