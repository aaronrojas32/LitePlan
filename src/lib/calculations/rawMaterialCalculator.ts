import { AnalyzedMaterial } from '../../types/material';
import { RawMaterialRequirement } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks, calculateShulkerStorage } from '../minecraft/storageCalculator';
import { processBuildTree } from './recipeResolutionEngine';

/**
 * Calculates global terminal raw harvestable material requirements across all build materials.
 * Uses recursive multi-tier recipe tree decomposition down to true terminal leaves (RAW tier).
 * Compares total required against user raw inventory (rawOwnedMap).
 */
export function calculateRawMaterials(
  materials: AnalyzedMaterial[],
  rawOwnedMap: Record<string, number> = {}
): RawMaterialRequirement[] {
  const buildItems = materials
    .filter((m) => m.totalRequired > 0)
    .map((m) => ({
      itemId: m.id,
      displayName: m.displayNameEs || m.displayNameEn || m.id,
      quantity: m.totalRequired,
    }));

  const { leafRawMaterials } = processBuildTree(buildItems);

  const results: RawMaterialRequirement[] = [];

  for (const [itemId, data] of leafRawMaterials.entries()) {
    const matDef = MATERIALS_DATABASE[itemId];
    const stackSize = matDef?.stackSize || 64;
    const requiredQuantity = data.quantity;
    const owned = Math.max(0, rawOwnedMap[itemId] || 0);
    const missing = Math.max(0, requiredQuantity - owned);

    const stacks = calculateStacks(requiredQuantity, stackSize).formatted;
    const stacksMissing = calculateStacks(missing, stackSize).formatted;
    const storage = calculateShulkerStorage(requiredQuantity, stackSize);

    const usedInList = Array.from(data.usedIn.entries()).map(([targetItemId, val]) => ({
      targetItemId,
      targetName: val.targetName,
      quantityRequired: val.quantityRequired,
    }));

    results.push({
      itemId,
      minecraftId: itemId,
      displayName: matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', ''),
      quantity: requiredQuantity,
      owned,
      missing,
      stacks,
      stacksMissing,
      storage,
      category: matDef?.category || 'nature',
      source: matDef?.source || 'vanilla',
      usedIn: usedInList,
    });
  }

  // Sort by missing amount descending, then by total required descending
  results.sort((a, b) => {
    if (b.missing !== a.missing) {
      return b.missing - a.missing;
    }
    return b.quantity - a.quantity;
  });

  return results;
}
