import { detectBusinessType } from '../lib/business-pain-promise-map';

const business = detectBusinessType('Pharma Solutions Inc');
console.log('Detected type:', business);
console.log('\nHas all required fields for v8.4?');
console.log('  - sharedReality:', !!business.sharedReality);
console.log('  - rootCause:', !!business.rootCause);
console.log('  - dependencyReveal:', !!business.dependencyReveal);
console.log('  - promiseStatement:', !!business.promiseStatement);
