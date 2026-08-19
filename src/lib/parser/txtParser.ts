import { ParsedMaterialRow } from '../../types/material';

/**
 * Checks if a line is an ASCII border like `+----+----+` or `|---...---|`
 */
function isAsciiBorder(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('+') && trimmed.endsWith('+') && trimmed.includes('-')
  ) || /^\|[-+]+\|$/.test(trimmed);
}

/**
 * Extracts column cells from a pipe-separated ASCII line: `| Col1 | Col2 | Col3 |`
 */
function extractPipeColumns(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return [];
  }

  // Remove first and last pipe
  const content = trimmed.substring(1, trimmed.length - 1);
  return content.split('|').map(s => s.trim());
}

/**
 * Parses numeric values handling thousand separators
 */
function parseQuantity(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/,/g, '').replace(/\s+/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

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

    // Skip decorative borders
    if (isAsciiBorder(line)) {
      continue;
    }

    const cols = extractPipeColumns(line);
    if (cols.length === 0) continue;

    // Single column usually means table title e.g. "| Lista de Materiales para el esquema ... |"
    if (cols.length === 1) {
      continue;
    }

    const lowerCols = cols.map(c => c.toLowerCase());

    // Check if this is a header row e.g. "| Item | Total | Missing | Available |"
    const isHeader = lowerCols.some(c =>
      ['item', 'material', 'bloque', 'name', 'nombre'].includes(c)
    ) && lowerCols.some(c =>
      ['total', 'missing', 'available', 'faltan', 'disponible'].includes(c)
    );

    if (isHeader) {
      lowerCols.forEach((col, idx) => {
        if (col.includes('item') || col.includes('material') || col.includes('name') || col.includes('bloque')) {
          itemCol = idx;
        } else if (col.includes('total') || col.includes('required') || col.includes('requerido')) {
          totalCol = idx;
        } else if (col.includes('missing') || col.includes('falta')) {
          missingCol = idx;
        } else if (col.includes('available') || col.includes('disponible')) {
          availableCol = idx;
        }
      });
      continue;
    }

    // Process data row
    const rawName = cols[itemCol] || '';
    if (!rawName) continue;

    const total = parseQuantity(cols[totalCol]);
    const missing = missingCol < cols.length ? parseQuantity(cols[missingCol]) : total;
    const available = availableCol < cols.length ? parseQuantity(cols[availableCol]) : Math.max(0, total - missing);

    // Only add if it has valid data (avoiding accidental bottom headers or separators)
    if (total > 0 || (cols.length > 1 && !isNaN(parseInt(cols[1], 10)))) {
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
