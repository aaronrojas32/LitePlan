import { AnalyzedMaterial } from '../../types/material';
import { ProjectProgress } from '../../types/project';
import { CraftingStep } from '../../types/recipe';

/**
 * Calculates overall project progress based on owned blocks vs required blocks,
 * as well as completed materials and crafting steps.
 */
export function calculateProjectProgress(
  materials: AnalyzedMaterial[],
  craftingSteps: CraftingStep[] = [],
  craftingCompletedMap: Record<string, boolean> = {}
): ProjectProgress {
  let totalBlocks = 0;
  let ownedBlocks = 0;
  let missingBlocks = 0;
  let completedMaterials = 0;

  for (const mat of materials) {
    totalBlocks += mat.totalRequired;
    const effectiveOwned = Math.min(mat.totalRequired, Math.max(0, mat.owned));
    ownedBlocks += effectiveOwned;
    const effectiveMissing = Math.max(0, mat.totalRequired - mat.owned);
    missingBlocks += effectiveMissing;

    if (effectiveMissing === 0 && mat.totalRequired > 0) {
      completedMaterials++;
    }
  }

  const percentage = totalBlocks > 0
    ? Math.min(100, Math.max(0, Math.round((ownedBlocks / totalBlocks) * 100)))
    : 0;

  const totalCraftingOps = craftingSteps.reduce((acc, s) => acc + s.craftsNeeded, 0);
  let completedCraftingOps = 0;

  for (const step of craftingSteps) {
    if (craftingCompletedMap[step.outputItemId]) {
      completedCraftingOps += step.craftsNeeded;
    }
  }

  return {
    totalBlocks,
    ownedBlocks,
    missingBlocks,
    percentage,
    totalMaterials: materials.length,
    completedMaterials,
    totalCraftingOps,
    completedCraftingOps,
    isComplete: totalBlocks > 0 && missingBlocks === 0,
  };
}

/**
 * Calculates progress percentage for a single material (0 to 100)
 */
export function calculateMaterialProgress(required: number, owned: number): number {
  if (required <= 0) return 100;
  const clampedOwned = Math.min(required, Math.max(0, owned));
  return Math.min(100, Math.max(0, Math.round((clampedOwned / required) * 100)));
}
