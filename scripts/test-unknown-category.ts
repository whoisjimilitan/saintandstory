import { generateEmailV4 } from '../lib/email-engine-v4';

const unknownBusiness = { 
  id: 'manual-1', 
  businessName: 'kL INT', 
  city: 'London', 
  firstName: 'John' 
};

try {
  const email = generateEmailV4(unknownBusiness);
  console.log('✅ Unknown category handled successfully\n');
  console.log('Email preview:');
  console.log(email.bodyText);
} catch (err) {
  console.log('❌ Error:', (err as Error).message);
}
