import { AnalyzedMaterial, ParsedMaterialRow, UnrecognizedMaterial } from './material';
import { RawMaterialRequirement, CraftingStep } from './recipe';
import { BuildSummary, FileFormat } from './parser';

export interface ProjectProgress {
  totalBlocks: number; // Sum of required quantities of build objects
  ownedBlocks: number; // Sum of min(owned, required) of build objects
  missingBlocks: number; // Math.max(0, totalBlocks - ownedBlocks)
  percentage: number; // 0 to 100 (derived strictly from build objects)
  totalMaterials: number;
  completedMaterials: number;
  totalCraftingOps: number;
  completedCraftingOps: number;
  isComplete: boolean;
}

export interface Project {
  id: string; // unique UUID or timestamp-based ID
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sourceFilename?: string;
  sourceFormat?: FileFormat;
  rawRowCount: number;
  parsedRows: ParsedMaterialRow[];
  materials: AnalyzedMaterial[]; // Target Build Objects
  unrecognized: UnrecognizedMaterial[];
  rawMaterials: RawMaterialRequirement[]; // Base raw resources to farm
  craftingSteps: CraftingStep[]; // Manufacturing steps needed
  ownedMap: Record<string, number>; // Build objects owned quantity (controls build progress)
  rawOwnedMap: Record<string, number>; // Raw resources owned quantity (does NOT directly increase build progress)
  gatheringCompletedMap?: Record<string, boolean>; // checklist state
  craftingCompletedMap?: Record<string, boolean>; // checklist state
  summary: BuildSummary;
  progress: ProjectProgress;
  thumbnail?: string; // Optional custom or block icon image
  tags?: string[];
}

export interface LitePlanBackup {
  version: string;
  exportedAt: string;
  projects: Project[];
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  autoSave: boolean;
  defaultStackSize: number;
}
