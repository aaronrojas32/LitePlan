import { AnalyzedMaterial, ParsedMaterialRow, UnrecognizedMaterial } from './material';
import { RawMaterialRequirement, CraftingStep } from './recipe';

export type FileFormat = 'csv' | 'txt_ascii' | 'tsv' | 'unknown';

export interface ParseResult {
  filename: string;
  format: FileFormat;
  rawRowCount: number;
  parsedRows: ParsedMaterialRow[];
  materials: AnalyzedMaterial[];
  unrecognized: UnrecognizedMaterial[];
  rawMaterials: RawMaterialRequirement[];
  craftingSteps: CraftingStep[];
  summary: BuildSummary;
}

export interface BuildSummary {
  totalUniqueMaterials: number;
  totalBlocks: number;
  totalMissing: number;
  totalOwned: number;
  totalAvailable: number;
  craftableCount: number;
  rawMaterialCount: number;
  totalStacks: number;
  totalCraftingOperations: number;
  uniqueRecipesCount: number;
  equivalentStorageFormatted: string; // e.g. "3 Shulkers + 12 stacks"
  shulkerStorageFormatted: string; // e.g. "2 Shulkers + 8 stacks + 32 items"
  doubleChestStorageFormatted: string; // e.g. "1 Double Chest + 8 stacks + 32 items"
  shulkersRequired: number; // e.g. 3
  doubleChestsRequired: number; // e.g. 2
}
