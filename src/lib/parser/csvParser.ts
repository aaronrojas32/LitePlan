import { ParsedMaterialRow } from '../../types/material';

/**
 * Detects the most probable delimiter in a CSV/TSV text (comma, semicolon, tab)
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
 * Parses a single line of delimited text taking quotes into account
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
 * Parses integer quantities handling commas/dots formatting
 */
function parseQuantity(val: string): number {
  if (!val) return 0;
  // Remove thousand separators
  const clean = val.replace(/,/g, '').replace(/\s+/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseCSV(content: string): ParsedMaterialRow[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines.slice(0, 5));
  const rows: ParsedMaterialRow[] = [];

  let headerIndex = -1;
  let itemCol = 0;
  let totalCol = 1;
  let missingCol = 2;
  let availableCol = 3;

  for (let i = 0; i < lines.length; i++) {
    const cols = parseDelimitedLine(lines[i], delimiter);
    if (cols.length === 0) continue;

    const lowerCols = cols.map(c => c.toLowerCase());

    // Check if this row is a header
    const isHeader = lowerCols.some(c =>
      ['item', 'material', 'bloque', 'name', 'nombre', 'total', 'missing', 'faltan'].includes(c)
    );

    if (isHeader) {
      headerIndex = i;
      lowerCols.forEach((col, idx) => {
        if (col.includes('item') || col.includes('material') || col.includes('name') || col.includes('nombre') || col.includes('bloque')) {
          itemCol = idx;
        } else if (col.includes('total') || col.includes('required') || col.includes('requerido') || col.includes('necesario')) {
          totalCol = idx;
        } else if (col.includes('missing') || col.includes('falta') || col.includes('faltante')) {
          missingCol = idx;
        } else if (col.includes('available') || col.includes('disponible') || col.includes('posee')) {
          availableCol = idx;
        }
      });
      continue;
    }

    // Skip non-header meta lines before header if any
    if (headerIndex === -1 && lines.length > 1 && i === 0 && isNaN(parseInt(cols[1], 10))) {
      continue;
    }

    const rawName = cols[itemCol] || '';
    if (!rawName) continue;

    const total = parseQuantity(cols[totalCol]);
    const missing = missingCol < cols.length ? parseQuantity(cols[missingCol]) : total;
    const available = availableCol < cols.length ? parseQuantity(cols[availableCol]) : Math.max(0, total - missing);

    if (total > 0 || rawName.length > 0) {
      rows.push({
        rawName,
        total: total || missing,
        missing: missing !== undefined ? missing : total,
        available,
        lineNumber: i + 1,
      });
    }
  }

  return rows;
}
