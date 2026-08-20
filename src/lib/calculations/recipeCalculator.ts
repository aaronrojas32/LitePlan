import { Recipe, CraftCalculationResult, CraftingStep } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks, calculateItemQuantity } from '../minecraft/storageCalculator';
import { getRecipeForItem } from '../recipes/recipeDatabase';
import { AnalyzedMaterial } from '../../types/material';
import { calculateRawMaterials } from './rawMaterialCalculator';

/**
 * Calculates the exact integer crafts required for a given target output.
 * Uses ceiling division since Minecraft crafting requires whole craft actions.
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
 * excess surplus, and the ingredient breakdown for all required craft cycles.
 */
export function calculateCraftDetails(recipe: Recipe, requiredQuantity: number): CraftCalculationResult {
  const craftsRequired = calculateCrafts(requiredQuantity, recipe.output.quantity);
  const producedQuantity = craftsRequired * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - requiredQuantity);

  const ingredientsNeeded = recipe.ingredients.map(ing => {
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
 * Builds the crafting operations list for all craftable materials in the build.
 * Also determines how many units can currently be crafted from available raw materials.
 */
export function generateCraftingList(
  materials: AnalyzedMaterial[],
  rawOwnedMap: Record<string, number> = {}
): CraftingStep[] {
  const steps: CraftingStep[] = [];

  for (const mat of materials) {
    if (!mat.craftable) continue;
    if (mat.totalRequired <= 0) continue;

    const recipe = getRecipeForItem(mat.id);
    if (!recipe) continue;

    const craftDetails = calculateCraftDetails(recipe, mat.totalRequired);

    // Determine bottleneck ingredient to compute maximum immediate crafts possible from raw inventory
    let maxCraftsPossible = Infinity;
    if (recipe.ingredients.length > 0) {
      for (const ing of recipe.ingredients) {
        const availableRaw = rawOwnedMap[ing.itemId] || 0;
        const possibleForIng = Math.floor(availableRaw / ing.quantity);
        maxCraftsPossible = Math.min(maxCraftsPossible, possibleForIng);
      }
    } else {
      maxCraftsPossible = 0;
    }
    const craftableWithRaw = Math.min(mat.totalRequired, Math.max(0, maxCraftsPossible * recipe.output.quantity));

    steps.push({
      outputItemId: mat.id,
      outputName: mat.displayName,
      outputQuantity: mat.totalRequired,
      ownedQuantity: mat.owned,
      missingQuantity: mat.missing,
      recipeType: recipe.type,
      craftsNeeded: craftDetails.craftsRequired,
      producedQuantity: craftDetails.producedQuantity,
      extraQuantity: craftDetails.extraQuantity,
      craftableWithRaw,
      recipe,
      ingredients: craftDetails.ingredientsNeeded,
    });
  }

  // Sort by total crafts needed descending
  steps.sort((a, b) => b.craftsNeeded - a.craftsNeeded);

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
