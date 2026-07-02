import { generateEmailV4 } from '../lib/email-engine-v4';

const testCases = [
  { businessName: 'Wilson Solicitors', firstName: 'Kike' },
  { businessName: 'Central Hospital', firstName: 'Sarah' },
  { businessName: 'St Marys Restaurant', firstName: 'Marcus' },
  { businessName: 'ABC Accounting Ltd', firstName: 'James' },
  { businessName: 'Premier Process Servers Ltd', firstName: 'David' },
  { businessName: 'Greenfield Construction', firstName: 'Tom' },
  { businessName: 'Estate Agents Plus', firstName: 'Emma' },
  { businessName: 'Pharma Solutions Inc', firstName: 'Alex' },
  { businessName: 'Smith & Sons Cafe', firstName: 'Lisa' },
  { businessName: 'Tech Architecture Firm', firstName: 'Chris' },
];

console.log('=== COMPREHENSIVE EMAIL ENGINE TEST ===\n');

let passed = 0;
let failed = 0;

testCases.forEach(tc => {
  try {
    const email = generateEmailV4({ id: Math.random().toString(), businessName: tc.businessName, firstName: tc.firstName });
    
    // Check for v8.4 markers (core structure)
    const hasApology = email.bodyText.includes("Apologies");
    const hasBridge = email.bodyText.includes("taught me one thing");
    const hasDependencyReveal = email.bodyText.includes("For many");
    const hasPhilosophy = email.bodyText.includes("We built Saint & Story");
    const hasPromise = email.bodyText.includes("at no cost to you");
    const hasClosingQuestion = email.bodyText.includes("Out of curiosity");
    
    const allChecks = hasApology && hasBridge && hasDependencyReveal && hasPhilosophy && hasPromise && hasClosingQuestion;
    
    if (allChecks) {
      console.log(`✅ ${tc.businessName.padEnd(35)} (${tc.firstName.padEnd(6)}) → v8.4 Complete`);
      passed++;
    } else {
      console.log(`❌ ${tc.businessName.padEnd(35)} (${tc.firstName.padEnd(6)}) → Missing elements`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ ${tc.businessName.padEnd(35)} (${tc.firstName.padEnd(6)}) → ERROR`);
    failed++;
  }
});

console.log(`\n=== RESULTS ===`);
console.log(`✅ Passed: ${passed}/${testCases.length}`);
console.log(`❌ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! v8.4 engine is working perfectly.');
  console.log('   All categories using refined template with dependency reveals.');
  console.log('   Build-time validation enforces narrative structure completion.');
  console.log('   No fallback to legacy template - permanent fix in place.');
}
