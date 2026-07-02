import { generateEmailV4 } from '../lib/email-engine-v4';

const email = generateEmailV4({ id: '1', businessName: 'Wilson Solicitors', firstName: 'Kike' });

console.log('Full email body:\n');
console.log(email.bodyText);
console.log('\n--- Checks ---');
console.log('Has "Apologies":', email.bodyText.includes("Apologies"));
console.log('Has "taught me one thing":', email.bodyText.includes("taught me one thing"));
console.log('Has "For many":', email.bodyText.includes("For many"));
console.log('Has "We built Saint & Story":', email.bodyText.includes("We built Saint & Story"));
console.log('Has "no cost to you":', email.bodyText.includes("no cost to you"));
console.log('Has "is having a same-day backup courier":', email.bodyText.includes("is having a same-day backup courier"));
console.log('Has "does your team ever need":', email.bodyText.includes("does your team ever need"));
