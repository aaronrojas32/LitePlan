import { ParsedMaterialRow } from '../../types/material';

/**
 * Detects the most probable delimiter in CSV/TSV text (comma, semicolon, tab).
 */
function detectDelimiter(firstFewLines: string[]): string {
  let commaCount = 0;
  let semiCount = 0;
  let tabCount = 0;

  for (const line of firstFewLines) {
    commaCount += (line.match(/,/g) || []).length;
    semiCount += (line.match(/;/g) || []).length;
    tabCount += (line.match(/\t/g) || []).length;
  }

  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  if (semiCount > commaCount) return ';';
  return ',';
}

/**
 * Parses a single line of delimited text while respecting quotation marks and escaped quotes.
 */
function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result.map(s => s.replace(/^"|"$/g, '').trim());
}

/**
 * Parses integer quantities and strips potential thousands formatting.
 */
function parseQuantity(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/,/g, '').replace(/\s+/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses standard CSV/TSV material list exports from Litematica.
 * Dynamically resolves column positions based on header labels (supporting English and Spanish headers).
 */
export function parseCSV(content: string): ParsedMaterialRow[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines.slice(0, 5));
  const rows: ParsedMaterialRow[] = [];

  let itemCol = 0;
  let totalCol = 1;
  let missingCol = 2;
  let availableCol = 3;
  let startLine = 0;

  // Header detection pass
  const firstRowCols = parseDelimitedLine(lines[0], delimiter);
  const isHeader = firstRowCols.some(col => {
    const lower = col.toLowerCase();
    return (
      lower.includes('item') ||
      lower.includes('material') ||
      lower.includes('total') ||
      lower.includes('missing') ||
      lower.includes('falta') ||
      lower.includes('disponible') ||
      lower.includes('available')
    );
  });

  if (isHeader) {
    startLine = 1;
    firstRowCols.forEach((col, idx) => {
      const lower = col.toLowerCase();
      if (lower.includes('item') || lower.includes('material') || lower.includes('nombre')) {
        itemCol = idx;
      } else if (lower.includes('total')) {
        totalCol = idx;
      } else if (lower.includes('missing') || lower.includes('falta') || lower.includes('faltante')) {
        missingCol = idx;
      } else if (lower.includes('available') || lower.includes('disponible') || lower.includes('tengo')) {
        availableCol = idx;
      }
    });
  }

  // Parse data rows
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseDelimitedLine(line, delimiter);

    if (cols.length === 0) continue;
    const rawName = cols[itemCol] || '';
    if (!rawName.trim()) continue;

    // Ignore repetitive header or total rows within the data
    const lowerName = rawName.toLowerCase();
    if (lowerName === 'item' || lowerName === 'material' || lowerName === 'total') continue;

    const total = parseQuantity(cols[totalCol] || '0');
    const missing = parseQuantity(cols[missingCol] || '0');
    const available = parseQuantity(cols[availableCol] || '0');
    const finalTotal = total > 0 ? total : (missing + available);

    if (finalTotal <= 0) continue;

    rows.push({
      rawName,
      total: finalTotal,
      missing,
      available,
      lineNumber: i,
    });
  }

  return rows;
}
