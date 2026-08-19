import { getRecipeForItem } from './recipeDatabase';
import { CraftingStep } from '../../types/recipe';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks } from '../minecraft/storageCalculator';

/**
 * Calculates direct ingredients needed for a given quantity of an item
 */
export function resolveImmediateIngredients(
  itemId: string,
  quantityNeeded: number
): {
  craftCount: number;
  outputProduced: number;
  ingredients: Array<{ itemId: string; quantity: number }>;
} | null {
  const recipe = getRecipeForItem(itemId);
  if (!recipe || quantityNeeded <= 0) return null;

  const craftCount = Math.ceil(quantityNeeded / recipe.output.quantity);
  const outputProduced = craftCount * recipe.output.quantity;

  const ingredients = recipe.ingredients.map(ing => ({
    itemId: ing.itemId,
    quantity: craftCount * ing.quantity,
  }));

  return {
    craftCount,
    outputProduced,
    ingredients,
  };
}

/**
 * Recursively resolves all crafting steps required to manufacture an item from base materials
 */
export function resolveAllCraftingSteps(
  itemId: string,
  quantityNeeded: number,
  visited = new Set<string>()
): CraftingStep[] {
  if (visited.has(itemId)) {
    return [];
  }

  const recipe = getRecipeForItem(itemId);
  if (!recipe || quantityNeeded <= 0) {
    return [];
  }

  const currentVisited = new Set(visited).add(itemId);
  const craftCount = Math.ceil(quantityNeeded / recipe.output.quantity);
  const producedQuantity = craftCount * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - quantityNeeded);

  const matDef = MATERIALS_DATABASE[itemId];
  const outputName = matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', '');

  const stepIngredients = recipe.ingredients.map(ing => {
    const ingDef = MATERIALS_DATABASE[ing.itemId];
    const totalUnits = craftCount * ing.quantity;
    const stackSize = ingDef?.stackSize || 64;
    return {
      itemId: ing.itemId,
      displayName: ingDef?.displayNameEs || ingDef?.displayNameEn || ing.itemId.replace('minecraft:', ''),
      quantity: totalUnits,
      stacks: calculateStacks(totalUnits, stackSize).formatted,
    };
  });

  const steps: CraftingStep[] = [
    {
      outputItemId: itemId,
      outputName,
      outputQuantity: quantityNeeded,
      ownedQuantity: 0,
      missingQuantity: quantityNeeded,
      recipeType: recipe.type,
      craftsNeeded: craftCount,
      producedQuantity,
      extraQuantity,
      recipe,
      ingredients: stepIngredients,
    },
  ];

  // Recurse on ingredients
  for (const ing of stepIngredients) {
    const subSteps = resolveAllCraftingSteps(ing.itemId, ing.quantity, currentVisited);
    steps.push(...subSteps);
  }

  return steps;
}
