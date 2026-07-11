/**
 * Keyword Normalizer
 * Converts search keywords to multiple variations
 * Enables flexible business discovery across different keywords
 */

// Map of keywords to multiple search variations
// Used to find businesses regardless of how the user phrases their search
const KEYWORD_VARIATIONS: Record<string, string[]> = {
  // Legal services
  "lawyer": ["lawyer", "solicitor", "law firm", "legal services", "barrister", "advocate"],
  "lawyers": ["lawyers", "solicitors", "law firms", "legal services"],
  "solicitor": ["solicitor", "solicitors", "law firm", "legal services"],
  "solicitors": ["solicitors", "solicitor", "law firm", "legal services"],
  "barrister": ["barrister", "barristers", "law firm", "solicitor"],
  "legal": ["legal services", "law firm", "solicitor", "lawyer"],

  // Accountancy
  "accountant": ["accountant", "accountants", "accounting firm", "chartered accountant", "cpa"],
  "accountants": ["accountants", "accountant", "accounting firm", "chartered accountant"],
  "accounting": ["accounting firm", "accountant", "chartered accountant"],
  "chartered accountant": ["chartered accountant", "accountant", "accounting firm"],

  // Estate agents
  "estate agent": ["estate agent", "estate agents", "property agent", "letting agent", "realtor"],
  "estate agents": ["estate agents", "estate agent", "property agent", "letting agent"],
  "property agent": ["property agent", "estate agent", "letting agent"],
  "letting agent": ["letting agent", "estate agent", "property management"],

  // Finance/Banking
  "financial advisor": ["financial advisor", "financial adviser", "wealth manager", "financial services"],
  "financial adviser": ["financial adviser", "financial advisor", "wealth manager"],
  "bank": ["bank", "banking", "financial services"],
  "insurance": ["insurance", "insurance broker", "insurance agent"],

  // Medical/Dental
  "dentist": ["dentist", "dental practice", "dental clinic"],
  "doctor": ["doctor", "gp surgery", "medical practice", "clinic"],
  "gp": ["gp surgery", "gp practice", "medical practice", "doctor"],
  "pharmacy": ["pharmacy", "pharmacist", "chemist"],

  // Construction/Trades
  "builder": ["builder", "construction", "building contractor", "building company"],
  "plumber": ["plumber", "plumbing", "plumbing services"],
  "electrician": ["electrician", "electrical", "electrical services"],
  "decorator": ["decorator", "decorating", "painting and decorating"],

  // Retail/Commerce
  "shop": ["shop", "retail store", "retail", "boutique", "store"],
  "restaurant": ["restaurant", "cafe", "bistro", "eatery", "dining"],
  "cafe": ["cafe", "coffee shop", "restaurant", "bistro"],
  "bar": ["bar", "pub", "tavern", "nightclub"],

  // Professional Services
  "consultant": ["consultant", "consulting", "consultancy"],
  "architect": ["architect", "architectural", "design studio"],
  "engineer": ["engineer", "engineering", "engineering firm"],
  "surveyor": ["surveyor", "surveying", "survey"],

  // Cleaning/Maintenance
  "cleaner": ["cleaner", "cleaning service", "cleaning company"],
  "cleaner": ["cleaning", "janitor", "housekeeping"],

  // Recruitment
  "recruiter": ["recruiter", "recruitment agency", "recruitment firm", "staffing"],
  "recruitment": ["recruitment agency", "recruiter", "staffing agency"],
};

/**
 * Get all keyword variations for a search term
 * Returns array of keywords to try, in order of preference
 */
export function getKeywordVariations(keyword: string): string[] {
  if (!keyword) return [];

  const normalized = keyword.toLowerCase().trim();

  // If exact match exists in variations map, use it
  if (KEYWORD_VARIATIONS[normalized]) {
    return KEYWORD_VARIATIONS[normalized];
  }

  // Try partial match (e.g., "accountant" matches "accountants")
  for (const [key, variations] of Object.entries(KEYWORD_VARIATIONS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return variations;
    }
  }

  // No variations found, return original keyword
  return [normalized];
}

/**
 * Get primary keyword (most specific/common variation)
 * Used as default search if others fail
 */
export function getPrimaryKeyword(keyword: string): string {
  const variations = getKeywordVariations(keyword);
  return variations[0] || keyword.toLowerCase().trim();
}

/**
 * Check if two keywords are related
 * Used to avoid redundant searches
 */
export function areKeywordsRelated(keyword1: string, keyword2: string): boolean {
  const variations1 = getKeywordVariations(keyword1);
  const variations2 = getKeywordVariations(keyword2);

  // If both keywords map to the same variations, they're related
  return variations1.some(v => variations2.includes(v));
}
