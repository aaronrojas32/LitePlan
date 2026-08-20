import { FileFormat, ParseResult, ValidationResult } from '../../types/parser';
import { parseCSV } from './csvParser';
import { parseAsciiTable } from './txtParser';
import { aggregateMaterials } from '../calculations/materialAggregator';
import { calculateRawMaterials } from '../calculations/rawMaterialCalculator';
import { generateCraftingList } from '../calculations/recipeCalculator';

/**
 * Detects format based on content structure and file extension
 */
export function detectFormat(content: string, filename?: string): FileFormat {
  const trimmed = content.trim();
  if (
    trimmed.includes('|') &&
    (trimmed.includes('+-') || trimmed.includes('| Total |') || trimmed.includes('| Item |') || trimmed.includes('| Material |') || trimmed.includes('| Missing |'))
  ) {
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
 * Performs rigorous validation on Litematica schematic file content
 * and returns actionable diagnostics and preview metadata.
 */
export function validateLitematicaContent(content: string, filename?: string): ValidationResult {
  const trimmed = content?.trim() || '';

  if (!trimmed) {
    return {
      isValid: false,
      format: 'unknown',
      error: 'The file is empty. Please provide a valid Litematica material list export (.csv or .txt).',
      detectedRowCount: 0,
      previewMaterialsCount: 0,
    };
  }

  // Check for non-Litematica web or raw JSON payloads
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return {
      isValid: false,
      format: 'unknown',
      error: 'The file appears to be in JSON format. Please upload a Litematica .csv, .tsv, or .txt (ASCII table) export.',
      detectedRowCount: 0,
      previewMaterialsCount: 0,
    };
  }

  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
    return {
      isValid: false,
      format: 'unknown',
      error: 'The file appears to be an HTML or XML web page. Please upload a valid Litematica material list export.',
      detectedRowCount: 0,
      previewMaterialsCount: 0,
    };
  }

  const format = detectFormat(content, filename);
  const parsedRows = format === 'txt_ascii' ? parseAsciiTable(content) : parseCSV(content);

  if (parsedRows.length === 0) {
    if (format === 'txt_ascii') {
      return {
        isValid: false,
        format,
        error: 'No valid material rows found in the ASCII table. Please ensure the table contains pipe-separated columns with "Item" and "Total" quantities.',
        detectedRowCount: 0,
        previewMaterialsCount: 0,
      };
    } else {
      return {
        isValid: false,
        format,
        error: "Missing required columns or delimiters. Please ensure the file contains 'Item' and 'Total' (or 'Missing'/'Available') headers with positive quantities.",
        detectedRowCount: 0,
        previewMaterialsCount: 0,
      };
    }
  }

  // Aggregate materials to inspect preview counts and unrecognized item warnings
  const { materials, unrecognized } = aggregateMaterials(parsedRows);

  let warning: string | undefined;
  if (unrecognized.length > 0) {
    warning = `${unrecognized.length} item(s) (e.g. ${unrecognized.slice(0, 2).map((u) => u.rawName).join(', ')}) are not standard Minecraft 1.21 blocks and will be tracked as raw resources.`;
  }

  return {
    isValid: true,
    format,
    warning,
    detectedRowCount: parsedRows.length,
    previewMaterialsCount: materials.length,
  };
}

/**
 * Unified parser for any Litematica export
 * Validates input and produces complete BuildSummary and crafting breakdown.
 */
export function parseLitematicaFile(
  content: string,
  filename: string = 'material_list.csv',
  ownedMap: Record<string, number> = {}
): ParseResult {
  const validation = validateLitematicaContent(content, filename);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid Litematica material export');
  }

  const format = validation.format;
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
    validation,
  };
}
