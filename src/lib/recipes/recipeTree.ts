import { RecipeTreeNode, MaterialTier } from '../../types/recipe';
import { getRecipeForItem } from './recipeDatabase';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks } from '../minecraft/storageCalculator';

/**
 * Builds a hierarchical recipe decomposition tree for any item with real crafts,
 * excess surplus math, and 4-tier categorization (BUILD -> INTERMEDIATE / PROCESSING -> RAW).
 */
export function buildRecipeTree(
  itemId: string,
  quantity: number,
  visited = new Set<string>(),
  isRoot = true
): RecipeTreeNode {
  const matDef = MATERIALS_DATABASE[itemId];
  const displayName = matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', '');
  const stackSize = matDef?.stackSize || 64;
  const stacks = calculateStacks(quantity, stackSize).formatted;

  const recipe = getRecipeForItem(itemId);

  // If item has no recipe or cyclical reference reached, it's a RAW terminal leaf
  if (!recipe || visited.has(itemId)) {
    return {
      itemId,
      displayName,
      totalQuantity: quantity,
      stacks,
      isLeaf: true,
      tier: isRoot ? 'BUILD' : 'RAW',
      transformationText: !recipe ? 'Base Raw Resource' : 'Circular Reference Protected',
    };
  }

  const currentVisited = new Set(visited).add(itemId);
  const craftCount = Math.ceil(quantity / recipe.output.quantity);
  const producedQuantity = craftCount * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - quantity);

  let tier: MaterialTier = 'INTERMEDIATE';
  if (isRoot) {
    tier = 'BUILD';
  } else if (
    recipe.type === 'smelting' ||
    recipe.type === 'blasting' ||
    recipe.type === 'smoking' ||
    recipe.type === 'stonecutting' ||
    recipe.type === 'campfire_cooking'
  ) {
    tier = 'PROCESSING';
  }

  const transformationText = recipe.type === 'smelting'
    ? `Smelting in furnace (${craftCount}x)`
    : recipe.type === 'stonecutting'
    ? `Stonecutter (${craftCount}x)`
    : `Crafting Table (${craftCount}x)`;

  const children: RecipeTreeNode[] = recipe.ingredients.map((ing) => {
    const requiredForIngredient = craftCount * ing.quantity;
    return buildRecipeTree(ing.itemId, requiredForIngredient, currentVisited, false);
  });

  return {
    itemId,
    displayName,
    totalQuantity: quantity,
    stacks,
    isLeaf: false,
    tier,
    recipeType: recipe.type,
    transformationText,
    recipe,
    craftCount,
    producedQuantity,
    extraQuantity,
    children,
  };
}
