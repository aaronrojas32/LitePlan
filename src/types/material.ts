import { ItemQuantityBreakdown } from '../lib/minecraft/storageCalculator';

export type MaterialCategory =
  | 'building'
  | 'wood'
  | 'stone'
  | 'redstone'
  | 'decoration'
  | 'ore'
  | 'nether'
  | 'end'
  | 'metal'
  | 'nature'
  | 'misc';

export interface MaterialDefinition {
  id: string; // e.g. "minecraft:polished_diorite"
  minecraftId: string; // e.g. "minecraft:polished_diorite"
  displayNameEn: string; // e.g. "Polished Diorite"
  displayNameEs: string; // e.g. "Diorita pulida"
  stackSize: number; // usually 64, 16, or 1
  category: MaterialCategory;
  craftable: boolean;
  isRaw: boolean;
  color?: string;
  iconEmoji?: string;
  source?: string;
}

export interface ParsedMaterialRow {
  rawName: string;
  total: number;
  missing: number;
  available: number;
  lineNumber?: number;
}

export interface AnalyzedMaterial {
  id: string;
  minecraftId: string;
  displayName: string;
  displayNameEn: string;
  displayNameEs: string;
  category: MaterialCategory;
  stackSize: number;
  totalRequired: number; // base truth (items / blocks)
  owned: number; // base truth (items / blocks)
  missing: number; // max(0, totalRequired - owned)
  available: number;
  quantity: ItemQuantityBreakdown; // full quantity breakdown for required
  quantityMissing: ItemQuantityBreakdown; // full quantity breakdown for missing
  stacksRequired: StackCalculation;
  stacksMissing: StackCalculation;
  storage: {
    items: number;
    stackSize: number;
    fullStacks: number;
    remainder: number;
    shulkersRequired: number;
    doubleChestsRequired: number;
    shulkerStorageFormatted: string; // e.g. "1 Shulker required"
    doubleChestStorageFormatted: string; // e.g. "1 Double Chest required"
  };
  craftable: boolean;
  isRaw: boolean;
  source?: string;
  unrecognized?: boolean;
}

export interface StackCalculation {
  total: number;
  stackSize: number;
  fullStacks: number;
  remainder: number;
  formatted: string; // e.g. "19 stacks + 32" or "1 stack" or "1 item"
  compact: string; // e.g. "19 + 32" or "1"
}

export interface UnrecognizedMaterial {
  rawName: string;
  total: number;
  missing: number;
  available: number;
  reason: string;
}
