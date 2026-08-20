import { Recipe, CraftCalculationResult, CraftingStep } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks, calculateItemQuantity } from '../minecraft/storageCalculator';
import { AnalyzedMaterial } from '../../types/material';
import { calculateRawMaterials } from './rawMaterialCalculator';
import { processBuildTree } from './recipeResolutionEngine';

/**
 * Calculates exact integer crafts required for a recipe output.
 * Example: 437 planks with a 4-plank recipe output -> 110 crafts.
 */
export function calculateCrafts(requiredQuantity: number, recipeOutputQuantity: number): number {
  if (requiredQuantity <= 0 || recipeOutputQuantity <= 0) return 0;
  return Math.ceil(requiredQuantity / recipeOutputQuantity);
}

/**
 * Calculates excess/surplus units produced beyond the required amount.
 * Example: 437 required, 110 crafts * 4 = 440 produced -> 3 surplus items.
 */
export function calculateExcess(requiredQuantity: number, recipeOutputQuantity: number): number {
  if (requiredQuantity <= 0 || recipeOutputQuantity <= 0) return 0;
  const crafts = calculateCrafts(requiredQuantity, recipeOutputQuantity);
  const produced = crafts * recipeOutputQuantity;
  return Math.max(0, produced - requiredQuantity);
}

/**
 * Calculates complete crafting details including total crafts, actual produced amount,
 * excess surplus, and ingredient breakdown.
 */
export function calculateCraftDetails(recipe: Recipe, requiredQuantity: number): CraftCalculationResult {
  const craftsRequired = calculateCrafts(requiredQuantity, recipe.output.quantity);
  const producedQuantity = craftsRequired * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - requiredQuantity);

  const ingredientsNeeded = recipe.ingredients.map((ing) => {
    const matDef = MATERIALS_DATABASE[ing.itemId];
    const totalUnits = craftsRequired * ing.quantity;
    const stackSize = matDef?.stackSize || 64;
    return {
      itemId: ing.itemId,
      displayName: matDef?.displayNameEs || matDef?.displayNameEn || ing.itemId.replace('minecraft:', ''),
      quantity: totalUnits,
      stacks: calculateStacks(totalUnits, stackSize).formatted,
    };
  });

  return {
    craftsRequired,
    producedQuantity,
    requiredQuantity,
    extraQuantity,
    ingredientsNeeded,
  };
}

/**
 * Builds the crafting operations list for all materials and intermediate steps required across the build.
 * Calculates immediate craftability from available raw materials inventory.
 */
export function generateCraftingList(
  materials: AnalyzedMaterial[],
  rawOwnedMap: Record<string, number> = {}
): CraftingStep[] {
  const buildItems = materials
    .filter((m) => m.totalRequired > 0)
    .map((m) => ({
      itemId: m.id,
      displayName: m.displayNameEs || m.displayNameEn || m.id,
      quantity: m.totalRequired,
    }));

  const { intermediateOperations } = processBuildTree(buildItems);
  const steps: CraftingStep[] = [];

  for (const op of intermediateOperations.values()) {
    const buildMat = materials.find((m) => m.id === op.outputItemId);
    const ownedQuantity = buildMat ? buildMat.owned : 0;
    const missingQuantity = Math.max(0, op.totalUnitsNeeded - ownedQuantity);

    // Determine bottleneck ingredient from raw inventory
    let maxCraftsPossible = Infinity;
    if (op.recipe.ingredients.length > 0) {
      for (const ing of op.recipe.ingredients) {
        const availableRaw = rawOwnedMap[ing.itemId] || 0;
        const possibleForIng = Math.floor(availableRaw / ing.quantity);
        maxCraftsPossible = Math.min(maxCraftsPossible, possibleForIng);
      }
    } else {
      maxCraftsPossible = 0;
    }
    const craftableWithRaw = Math.min(
      op.totalUnitsNeeded,
      Math.max(0, maxCraftsPossible * op.recipe.output.quantity)
    );

    steps.push({
      outputItemId: op.outputItemId,
      outputName: op.outputName,
      outputQuantity: op.totalUnitsNeeded,
      ownedQuantity,
      missingQuantity,
      recipeType: op.recipe.type,
      craftsNeeded: op.craftsNeeded,
      producedQuantity: op.producedQuantity,
      extraQuantity: op.extraQuantity,
      craftableWithRaw,
      recipe: op.recipe,
      ingredients: op.ingredients,
    });
  }

  // Sort: Operations for direct build objects first, then by crafts needed descending
  steps.sort((a, b) => {
    const aIsBuild = materials.some((m) => m.id === a.outputItemId);
    const bIsBuild = materials.some((m) => m.id === b.outputItemId);
    if (aIsBuild && !bIsBuild) return -1;
    if (!aIsBuild && bIsBuild) return 1;
    return b.craftsNeeded - a.craftsNeeded;
  });

  return steps;
}

/**
 * Resolves full raw ingredient breakdown for a single item requirement.
 */
export function getItemRawBreakdown(itemId: string, quantity: number) {
  const dummyMat: AnalyzedMaterial = {
    id: itemId,
    minecraftId: itemId,
    displayName: itemId,
    displayNameEn: itemId,
    displayNameEs: itemId,
    category: 'building',
    stackSize: 64,
    totalRequired: quantity,
    owned: 0,
    missing: quantity,
    available: 0,
    quantity: calculateItemQuantity(quantity, 64),
    quantityMissing: calculateItemQuantity(quantity, 64),
    stacksRequired: {
      total: quantity,
      stackSize: 64,
      fullStacks: Math.floor(quantity / 64),
      remainder: quantity % 64,
      formatted: calculateStacks(quantity, 64).formatted,
      compact: `${Math.floor(quantity / 64)}s ${quantity % 64}`,
    },
    stacksMissing: {
      total: quantity,
      stackSize: 64,
      fullStacks: Math.floor(quantity / 64),
      remainder: quantity % 64,
      formatted: calculateStacks(quantity, 64).formatted,
      compact: `${Math.floor(quantity / 64)}s ${quantity % 64}`,
    },
    storage: {
      items: quantity,
      stackSize: 64,
      fullStacks: Math.floor(quantity / 64),
      remainder: quantity % 64,
      shulkersRequired: Math.ceil(quantity / (27 * 64)),
      doubleChestsRequired: Math.ceil(quantity / (54 * 64)),
      shulkerStorageFormatted: `${Math.ceil(quantity / (27 * 64))} Shulkers`,
      doubleChestStorageFormatted: `${Math.ceil(quantity / (54 * 64))} Double Chests`,
    },
    craftable: true,
    isRaw: false,
    source: 'vanilla',
  };

  const rawMaterials = calculateRawMaterials([dummyMat]);
  return {
    itemId,
    quantity,
    rawMaterials,
  };
}
