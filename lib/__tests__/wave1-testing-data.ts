/**
 * WAVE 1 TESTING DATA
 *
 * Real prospect data enriched with observations, pain points, and business patterns.
 * These are the 6 original test prospects from psychological framework validation.
 */

export const WAVE1_TEST_PROSPECTS = [
  {
    id: "test-001",
    name: "haart",
    category: "estate-agents",
    location: "Leeds",
    observations:
      "Your best branch gets 4.8★ reviews. Your newer branch gets 3.2★. Clients consistently mention the difference.",
    pain_point_review: "inconsistent service quality across branches",
    business_pattern: "branch managers not equally polished, variance when scaling",
    weekly_jobs: 12,
    email_sent_at: null,
  },
  {
    id: "test-002",
    name: "Monroe Estate Agents",
    category: "estate-agents",
    location: "Alwoodley",
    observations:
      "Reviews mention inconsistent follow-up times between your Leeds and Bradford offices. Some clients wait 24 hours, others get next-day service.",
    pain_point_review: "operational inconsistency across locations causing client frustration",
    business_pattern: "communication gaps between branches creating perceived service differences",
    weekly_jobs: 10,
    email_sent_at: null,
  },
  {
    id: "test-003",
    name: "Linley & Simpson",
    category: "estate-agents",
    location: "Leeds",
    observations:
      "Your Google reviews show consistent 5★ for professionalism but mention 'slow response to emails' in 3 recent reviews. Student lettings market is fast-moving.",
    pain_point_review: "response time friction losing student lettings to faster competitors",
    business_pattern: "manual email handling becoming bottleneck as volume grows",
    weekly_jobs: 8,
    email_sent_at: null,
  },
  {
    id: "test-004",
    name: "Greater London Properties",
    category: "estate-agents",
    location: "Bloomsbury",
    observations:
      "Bloomsbury luxury market. Your reviews are strong but you're not visible for 'same-day viewings' searches. Competitors advertise 24-hour response.",
    pain_point_review: "customer acquisition friction - losing leads to visibility and speed",
    business_pattern: "marketing spend high but ROI unclear, no clear differentiation",
    weekly_jobs: 15,
    email_sent_at: null,
  },
  {
    id: "test-005",
    name: "Cornerstone Logistics",
    category: "removals",
    location: "London",
    observations:
      "Operating across 4 London postcodes. Google reviews show 'professional in central' but 'unpredictable in suburbs' patterns. Same company, different perception.",
    pain_point_review: "service quality variance undermining brand consistency",
    business_pattern: "managing consistency across multiple locations with different partners",
    weekly_jobs: 18,
    email_sent_at: null,
  },
  {
    id: "test-006",
    name: "Westpoint Pharmacy",
    category: "pharmacy",
    location: "Bristol",
    observations:
      "Regular customers relocating mentioned in reviews. 3 customers say 'moved away but miss your service'. Mail-order opportunity: customers leaving due to geography, not dissatisfaction.",
    pain_point_review: "customer churn to relocation - quiet revenue loss",
    business_pattern: "accepting customer relocation as normal instead of capturing mail-order revenue",
    weekly_jobs: 8,
    email_sent_at: null,
  },
];

/**
 * Expected outcomes by prospect.
 *
 * These are predictions based on the psychology framework:
 * - Recognition should be specific (prospect recognizes themselves)
 * - Relief should name actual burden (not generic problem)
 * - Trust should show methodology
 * - Action should be validation question
 */
export const WAVE1_EXPECTED_OUTCOMES = {
  "test-001": {
    pressure_type: "Service Quality Inconsistency",
    should_recognize: true,
    burden_named: "managing branch variance personally",
    reason: "Specific observation about star ratings, client impact obvious",
  },
  "test-002": {
    pressure_type: "Service Quality Inconsistency",
    should_recognize: true,
    burden_named: "communication gaps between offices creating frustration",
    reason: "Specific follow-up time variance mentioned in reviews",
  },
  "test-003": {
    pressure_type: "Time-Critical Movement",
    should_recognize: true,
    burden_named: "manual email handling bottleneck in fast market",
    reason: "Student lettings context + speed criticism + operational reality",
  },
  "test-004": {
    pressure_type: "Customer Acquisition Friction",
    should_recognize: true,
    burden_named: "marketing spend high but ROI unclear, losing to visibility",
    reason: "Luxury market context + competitor differentiation + search visibility issue",
  },
  "test-005": {
    pressure_type: "Service Quality Inconsistency",
    should_recognize: true,
    burden_named: "managing consistency across 4 locations with different partners",
    reason: "Multi-location pattern + review variance + coordination reality",
  },
  "test-006": {
    pressure_type: "Customer Churn",
    should_recognize: true,
    burden_named: "quiet revenue loss from relocation (mail-order opportunity)",
    reason: "Specific pattern in reviews, emotional loss not quantified, opportunity clear",
  },
};
