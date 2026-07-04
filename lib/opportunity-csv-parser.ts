import { parse } from "csv-parse/sync";

export interface OpportunityCsvRow {
  companyName: string;
  website: string;
  contactName?: string;
  contactEmail?: string;
  sourcePlatform: string;
  sourceUrl?: string;
  postedDate: string;
  originalWording: string;
  confidence: number;
}

const REQUIRED_COLUMNS = [
  "companyName",
  "website",
  "sourcePlatform",
  "postedDate",
  "originalWording",
  "confidence",
];

export function parseOpportunityCsv(csvContent: string): OpportunityCsvRow[] {
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new Error("CSV is empty");
  }

  // Validate headers
  const headers = Object.keys(records[0]);
  const missingRequired = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missingRequired.length > 0) {
    throw new Error(`Missing required columns: ${missingRequired.join(", ")}`);
  }

  // Parse and validate rows
  return records.map((record, index) => {
    try {
      // Validate required fields
      if (!record.companyName?.trim()) {
        throw new Error("Company name is required");
      }
      if (!record.website?.trim()) {
        throw new Error("Website is required");
      }
      if (!record.sourcePlatform?.trim()) {
        throw new Error("Source platform is required");
      }
      if (!record.postedDate?.trim()) {
        throw new Error("Posted date is required");
      }
      if (!record.originalWording?.trim()) {
        throw new Error("Original wording is required");
      }

      // Validate and parse confidence
      const confidence = parseInt(record.confidence, 10);
      if (isNaN(confidence) || confidence < 0 || confidence > 100) {
        throw new Error("Confidence must be a number between 0-100");
      }

      // Validate date format
      const dateObj = new Date(record.postedDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date format: ${record.postedDate}`);
      }

      return {
        companyName: record.companyName.trim(),
        website: record.website.trim(),
        contactName: record.contactName?.trim() || undefined,
        contactEmail: record.contactEmail?.trim() || undefined,
        sourcePlatform: record.sourcePlatform.trim(),
        sourceUrl: record.sourceUrl?.trim() || undefined,
        postedDate: record.postedDate.trim(),
        originalWording: record.originalWording.trim(),
        confidence,
      };
    } catch (error) {
      throw new Error(
        `Row ${index + 2} validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}

export function validateCsvFormat(csvContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    parseOpportunityCsv(csvContent);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
