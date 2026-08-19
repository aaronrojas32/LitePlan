import { Recipe, CraftCalculationResult, CraftingStep } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks, calculateItemQuantity } from '../minecraft/storageCalculator';
import { getRecipeForItem } from '../recipes/recipeDatabase';
import { AnalyzedMaterial } from '../../types/material';
import { calculateRawMaterials } from './rawMaterialCalculator';

/**
 * Calculates the exact integer crafts required for a recipe output
 * e.g. 437 planks with recipe producing 4 planks -> 110 crafts
 */
export function calculateCrafts(requiredQuantity: number, recipeOutputQuantity: number): number {
  if (requiredQuantity <= 0 || recipeOutputQuantity <= 0) return 0;
  return Math.ceil(requiredQuantity / recipeOutputQuantity);
}

/**
 * Calculates excess/surplus units produced beyond required amount
 * e.g. 437 required, 110 crafts * 4 = 440 produced -> 3 extra
 */
export function calculateExcess(requiredQuantity: number, recipeOutputQuantity: number): number {
  if (requiredQuantity <= 0 || recipeOutputQuantity <= 0) return 0;
  const crafts = calculateCrafts(requiredQuantity, recipeOutputQuantity);
  const produced = crafts * recipeOutputQuantity;
  return Math.max(0, produced - requiredQuantity);
}

/**
 * Calculates full craft result including excess and needed ingredients
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
 * Builds all crafting steps required for build materials, including craftable availability
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

    // Calculate how many could be crafted from available raw materials
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

  // Sort by crafts needed descending
  steps.sort((a, b) => b.craftsNeeded - a.craftsNeeded);

  return steps;
}

export interface SingleItemBreakdown {
  rawMaterials: Array<{
    itemId: string;
    displayName: string;
    quantity: number;
    stacks: string;
  }>;
}

export function getItemRawBreakdown(itemId: string, quantity: number): SingleItemBreakdown {
  const q = calculateItemQuantity(quantity, MATERIALS_DATABASE[itemId]?.stackSize || 64);
  const dummyMaterial: AnalyzedMaterial = {
    id: itemId,
    minecraftId: itemId,
    displayName: MATERIALS_DATABASE[itemId]?.displayNameEs || itemId,
    displayNameEn: MATERIALS_DATABASE[itemId]?.displayNameEn || itemId,
    displayNameEs: MATERIALS_DATABASE[itemId]?.displayNameEs || itemId,
    category: 'misc',
    stackSize: q.stackSize,
    totalRequired: quantity,
    owned: 0,
    missing: quantity,
    available: 0,
    quantity: q,
    quantityMissing: q,
    stacksRequired: {
      total: q.items,
      stackSize: q.stackSize,
      fullStacks: q.fullStacks,
      remainder: q.remainder,
      formatted: q.stacksFormatted,
      compact: q.stacksCompact,
    },
    stacksMissing: {
      total: q.items,
      stackSize: q.stackSize,
      fullStacks: q.fullStacks,
      remainder: q.remainder,
      formatted: q.stacksFormatted,
      compact: q.stacksCompact,
    },
    storage: {
      items: q.items,
      stackSize: q.stackSize,
      fullStacks: q.fullStacks,
      remainder: q.remainder,
      shulkersRequired: q.shulkersRequired,
      doubleChestsRequired: q.doubleChestsRequired,
      shulkerStorageFormatted: q.shulkerStorageText,
      doubleChestStorageFormatted: q.doubleChestStorageText,
    },
    craftable: true,
    isRaw: false,
  };

  const rawList = calculateRawMaterials([dummyMaterial]);

  return {
    rawMaterials: rawList.map(r => ({
      itemId: r.itemId,
      displayName: r.displayName,
      quantity: r.quantity,
      stacks: r.stacks,
    })),
  };
}
