import { AnalyzedMaterial } from '../../types/material';
import { RawMaterialRequirement } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { getRecipeForItem } from '../recipes/recipeDatabase';
import { calculateStacks, calculateShulkerStorage } from '../minecraft/storageCalculator';

/**
 * Recursively accumulates leaf raw materials needed for a specific item quantity
 */
function accumulateRawMaterials(
  itemId: string,
  quantity: number,
  targetItemId: string,
  targetName: string,
  rawMap: Map<string, {
    quantity: number;
    usedIn: Map<string, { targetName: string; quantityRequired: number }>;
  }>,
  visited = new Set<string>()
) {
  if (quantity <= 0) return;

  const recipe = getRecipeForItem(itemId);

  // If there's no recipe or we visited this in circular recursion, treat it as a raw material
  if (!recipe || visited.has(itemId)) {
    const existing = rawMap.get(itemId);
    if (existing) {
      existing.quantity += quantity;
      const targetExisting = existing.usedIn.get(targetItemId);
      if (targetExisting) {
        targetExisting.quantityRequired += quantity;
      } else {
        existing.usedIn.set(targetItemId, { targetName, quantityRequired: quantity });
      }
    } else {
      const usedInMap = new Map<string, { targetName: string; quantityRequired: number }>();
      usedInMap.set(targetItemId, { targetName, quantityRequired: quantity });
      rawMap.set(itemId, {
        quantity,
        usedIn: usedInMap,
      });
    }
    return;
  }

  const currentVisited = new Set(visited).add(itemId);
  const craftCount = Math.ceil(quantity / recipe.output.quantity);

  for (const ing of recipe.ingredients) {
    const requiredForIngredient = craftCount * ing.quantity;
    accumulateRawMaterials(
      ing.itemId,
      requiredForIngredient,
      targetItemId,
      targetName,
      rawMap,
      currentVisited
    );
  }
}

/**
 * Calculates total global raw materials required for all materials in the build,
 * taking into account the user's raw inventory (rawOwnedMap).
 */
export function calculateRawMaterials(
  materials: AnalyzedMaterial[],
  rawOwnedMap: Record<string, number> = {}
): RawMaterialRequirement[] {
  const rawMap = new Map<string, {
    quantity: number;
    usedIn: Map<string, { targetName: string; quantityRequired: number }>;
  }>();

  for (const mat of materials) {
    const targetName = mat.displayNameEs || mat.displayNameEn || mat.id;

    accumulateRawMaterials(
      mat.id,
      mat.totalRequired,
      mat.id,
      targetName,
      rawMap
    );
  }

  const results: RawMaterialRequirement[] = [];

  for (const [itemId, data] of rawMap.entries()) {
    const matDef = MATERIALS_DATABASE[itemId];
    const stackSize = matDef?.stackSize || 64;
    const requiredQuantity = data.quantity;
    const owned = Math.max(0, rawOwnedMap[itemId] || 0);
    const missing = Math.max(0, requiredQuantity - owned);

    const stacks = calculateStacks(requiredQuantity, stackSize).formatted;
    const stacksMissing = calculateStacks(missing, stackSize).formatted;
    const storage = calculateShulkerStorage(requiredQuantity, stackSize);

    const usedInList = Array.from(data.usedIn.entries()).map(([targetItemId, itemData]) => ({
      targetItemId,
      targetName: itemData.targetName,
      quantityRequired: itemData.quantityRequired,
    }));

    results.push({
      itemId,
      minecraftId: matDef?.minecraftId || itemId,
      displayName: matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', ''),
      quantity: requiredQuantity,
      owned,
      missing,
      stacks,
      stacksMissing,
      storage,
      category: matDef?.category || 'misc',
      source: matDef?.source || 'Mine / Gather in world',
      usedIn: usedInList,
    });
  }

  // Sort by quantity descending
  results.sort((a, b) => b.quantity - a.quantity);

  return results;
}
