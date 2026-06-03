/**
 * Test Script: Verify slug matching logic
 *
 * This tests the generateSlug function to ensure it produces correct slugs.
 * Useful for debugging slug mismatch issues.
 *
 * Usage:
 *   npx tsx test-slug-matching.ts
 */

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to dashes
    .replace(/-+/g, "-"); // Deduplicate dashes
}

interface TestCase {
  businessName: string;
  expectedSlug: string;
}

const testCases: TestCase[] = [
  {
    businessName: "Wilson Solicitors",
    expectedSlug: "wilson-solicitors",
  },
  {
    businessName: "Smith & Sons Ltd.",
    expectedSlug: "smith-sons-ltd",
  },
  {
    businessName: "ABC  Logistics  Ltd",
    expectedSlug: "abc-logistics-ltd",
  },
  {
    businessName: "John's Law Firm (UK)",
    expectedSlug: "johns-law-firm-uk",
  },
  {
    businessName: "100% Courier Services",
    expectedSlug: "100-courier-services",
  },
  {
    businessName: "Building & Construction Co.",
    expectedSlug: "building-construction-co",
  },
];

console.log("\n🧪 SLUG GENERATION TEST\n");
console.log("Testing generateSlug() function:\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase) => {
  const generated = generateSlug(testCase.businessName);
  const isMatch = generated === testCase.expectedSlug;

  const icon = isMatch ? "✅" : "❌";
  console.log(
    `${icon} "${testCase.businessName}"`
  );
  console.log(`   Generated: ${generated}`);
  console.log(`   Expected:  ${testCase.expectedSlug}`);

  if (isMatch) {
    passed++;
  } else {
    failed++;
  }

  console.log("");
});

console.log("─".repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log("✅ All tests passed! Slug generation is consistent.\n");
} else {
  console.log(
    "❌ Some tests failed. There may be a mismatch in slug generation.\n"
  );
}

// Additional: test the actual URL format
console.log("EXAMPLE URLS:");
testCases.slice(0, 3).forEach((testCase) => {
  const slug = generateSlug(testCase.businessName);
  console.log(
    `  /prospect/${slug} → "${testCase.businessName}"`
  );
});

console.log("");
