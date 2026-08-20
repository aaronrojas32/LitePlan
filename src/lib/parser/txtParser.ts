import { ParsedMaterialRow } from '../../types/material';

/**
 * Checks if a line is an ASCII table border separator (e.g. `+----+----+` or `|---...---|`).
 */
function isAsciiBorder(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('+') && trimmed.endsWith('+') && trimmed.includes('-')
  ) || /^\|[-+]+\|$/.test(trimmed);
}

/**
 * Extracts column cells from a pipe-separated ASCII line: `| Col1 | Col2 | Col3 |`.
 */
function extractPipeColumns(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return [];
  }

  // Remove outermost leading and trailing pipe delimiters
  const content = trimmed.substring(1, trimmed.length - 1);
  return content.split('|').map(s => s.trim());
}

/**
 * Parses integer numeric values and removes thousands separators.
 */
function parseQuantity(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/,/g, '').replace(/\s+/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses Litematica ASCII table `.txt` export format.
 * Ignores border dividers and resolves column indices dynamically from table headers.
 */
export function parseAsciiTable(content: string): ParsedMaterialRow[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const rows: ParsedMaterialRow[] = [];

  let itemCol = 0;
  let totalCol = 1;
  let missingCol = 2;
  let availableCol = 3;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip decorative box-drawing borders
    if (isAsciiBorder(line)) {
      continue;
    }

    const cols = extractPipeColumns(line);
    if (cols.length === 0) continue;

    // Single column lines represent table titles or comments
    if (cols.length === 1) {
      continue;
    }

    // Inspect header row to calibrate column positions
    const isHeader = cols.some(col => {
      const lower = col.toLowerCase();
      return (
        lower.includes('item') ||
        lower.includes('material') ||
        lower.includes('total') ||
        lower.includes('missing') ||
        lower.includes('falta') ||
        lower.includes('available') ||
        lower.includes('disponible')
      );
    });

    if (isHeader) {
      cols.forEach((col, idx) => {
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
      continue;
    }

    // Extract item row data
    const rawName = cols[itemCol] || '';
    if (!rawName || rawName === 'Item' || rawName === 'Material' || rawName === 'Total') {
      continue;
    }

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
