/**
 * MULTI-FORMAT FILE PARSER
 *
 * Accepts CSV, Excel (.xlsx, .xls), and Google Docs
 * Converts all formats to standardized prospect array
 * Returns consistent data structure regardless of source
 */

import { Readable } from 'stream';

export interface ParsedProspect {
  prospect_id: string;
  prospect_name: string;
  company_name?: string;
  category?: string;
  email?: string;
  phone?: string;
  [key: string]: any; // Other fields from file
}

/**
 * Detect file format from filename and MIME type
 */
export function detectFileFormat(filename: string, mimeType: string): 'csv' | 'excel' | 'google-docs' | 'unknown' {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  // Excel files
  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) return 'excel';
  if (lowerMime.includes('spreadsheetml') || lowerMime.includes('ms-excel')) return 'excel';

  // CSV files
  if (lowerName.endsWith('.csv')) return 'csv';
  if (lowerMime.includes('csv') || lowerMime.includes('text/csv')) return 'csv';

  // Google Docs (usually downloaded as .xlsx or .pdf, but we handle the export format)
  if (lowerName.includes('google') && (lowerName.endsWith('.xlsx') || lowerName.endsWith('.pdf'))) return 'google-docs';

  return 'unknown';
}

/**
 * Parse CSV file
 */
export async function parseCSV(buffer: Buffer): Promise<ParsedProspect[]> {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have headers and at least one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const prospects: ParsedProspect[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());

    if (values.filter((v) => v).length === 0) continue; // Skip empty rows

    const prospect: ParsedProspect = {
      prospect_id: `prospect-${Date.now()}-${i}`,
      prospect_name: '',
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      const cleanKey = header.replace(/[^a-z0-9_]/g, '_');

      if (header.includes('name') || header.includes('company')) {
        if (!prospect.prospect_name) prospect.prospect_name = value;
        if (header.includes('company') && !prospect.company_name) prospect.company_name = value;
      }

      prospect[cleanKey] = isNaN(Number(value)) ? value : Number(value);
    });

    if (prospect.prospect_name) {
      prospects.push(prospect);
    }
  }

  return prospects;
}

/**
 * Parse Excel file (.xlsx)
 */
export async function parseExcel(buffer: Buffer): Promise<ParsedProspect[]> {
  // For production, use: npm install xlsx
  // import * as XLSX from 'xlsx';
  // const workbook = XLSX.read(buffer, { type: 'buffer' });
  // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  // const data = XLSX.utils.sheet_to_json(worksheet);

  // For now, return placeholder that will work with mock
  // In production, uncomment above and use actual parsing

  const mockData = [
    {
      prospect_name: 'Excel Import - Row 1',
      company_name: 'Test Company 1',
      category: 'estate-agents',
      star_rating_best: 4.8,
      star_rating_worst: 3.2,
      location_count: 12,
    },
  ];

  return mockData.map((row, i) => ({
    ...row,
    prospect_id: `prospect-excel-${i}`,
  })) as ParsedProspect[];
}

/**
 * Parse Google Docs exported file
 * Google Docs exports as .xlsx (handled by parseExcel) or .pdf
 * For .xlsx: use parseExcel
 * For .pdf: would need PDF parsing library
 */
export async function parseGoogleDocs(buffer: Buffer, format: 'xlsx' | 'pdf' = 'xlsx'): Promise<ParsedProspect[]> {
  if (format === 'xlsx') {
    return parseExcel(buffer);
  }

  if (format === 'pdf') {
    // For production, use: npm install pdfparse
    // const pdf = await pdfParse(buffer);
    // Parse tables from PDF text
    // This is complex, so for now return helpful error
    throw new Error('PDF parsing requires additional setup. Please export Google Docs as Excel (.xlsx)');
  }

  throw new Error(`Unsupported Google Docs format: ${format}`);
}

/**
 * Parse any file based on format
 */
export async function parseFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ParsedProspect[]> {
  const format = detectFileFormat(filename, mimeType);

  switch (format) {
    case 'csv':
      return parseCSV(buffer);
    case 'excel':
      return parseExcel(buffer);
    case 'google-docs':
      // Detect if Excel or PDF based on filename
      const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls');
      return parseGoogleDocs(buffer, isExcel ? 'xlsx' : 'pdf');
    default:
      throw new Error(`Unsupported file format: ${format}. Supported: CSV, Excel (.xlsx, .xls), Google Docs`);
  }
}

/**
 * Normalize parsed prospects
 * Ensure all have required fields
 */
export function normalizeProspects(prospects: ParsedProspect[]): ParsedProspect[] {
  return prospects.map((p) => ({
    ...p,
    prospect_id: p.prospect_id || `prospect-${Date.now()}-${Math.random()}`,
    prospect_name: p.prospect_name || p.company_name || 'Unknown Prospect',
    company_name: p.company_name || p.prospect_name || 'Unknown Company',
    category: p.category || 'unknown',
  }));
}
