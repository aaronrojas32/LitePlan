import { FileFormat, ParseResult } from '../../types/parser';
import { parseCSV } from './csvParser';
import { parseAsciiTable } from './txtParser';
import { aggregateMaterials } from '../calculations/materialAggregator';
import { calculateRawMaterials } from '../calculations/rawMaterialCalculator';
import { generateCraftingList } from '../calculations/recipeCalculator';

/**
 * Detects format based on content and file extension
 */
export function detectFormat(content: string, filename?: string): FileFormat {
  const trimmed = content.trim();
  if (trimmed.includes('|') && (trimmed.includes('+-') || trimmed.includes('| Total |') || trimmed.includes('| Item |'))) {
    return 'txt_ascii';
  }
  if (filename?.endsWith('.tsv') || (content.includes('\t') && !content.includes(','))) {
    return 'tsv';
  }
  if (trimmed.includes(',') || filename?.endsWith('.csv')) {
    return 'csv';
  }
  if (filename?.endsWith('.txt')) {
    return 'txt_ascii';
  }
  return 'csv';
}

/**
 * Unified parser for any Litematica export
 */
export function parseLitematicaFile(
  content: string,
  filename: string = 'material_list.csv',
  ownedMap: Record<string, number> = {}
): ParseResult {
  const format = detectFormat(content, filename);
  const parsedRows = format === 'txt_ascii' ? parseAsciiTable(content) : parseCSV(content);

  const { materials, unrecognized, summary } = aggregateMaterials(parsedRows, ownedMap);
  const rawMaterials = calculateRawMaterials(materials);
  const craftingSteps = generateCraftingList(materials);

  summary.rawMaterialCount = rawMaterials.length;

  return {
    filename,
    format,
    rawRowCount: parsedRows.length,
    parsedRows,
    materials,
    unrecognized,
    rawMaterials,
    craftingSteps,
    summary,
  };
}
