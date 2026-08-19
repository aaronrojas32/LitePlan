import { RecipeTreeNode } from '../../types/recipe';
import { getRecipeForItem } from './recipeDatabase';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks } from '../minecraft/storageCalculator';

/**
 * Builds a hierarchical recipe decomposition tree for any item with real crafts and excess math
 */
export function buildRecipeTree(
  itemId: string,
  quantity: number,
  visited = new Set<string>()
): RecipeTreeNode {
  const matDef = MATERIALS_DATABASE[itemId];
  const displayName = matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', '');
  const stackSize = matDef?.stackSize || 64;
  const stacks = calculateStacks(quantity, stackSize).formatted;

  const recipe = getRecipeForItem(itemId);

  // If item is not craftable or cyclical reference reached, it's a leaf
  if (!recipe || visited.has(itemId)) {
    return {
      itemId,
      displayName,
      totalQuantity: quantity,
      stacks,
      isLeaf: true,
    };
  }

  const currentVisited = new Set(visited).add(itemId);
  const craftCount = Math.ceil(quantity / recipe.output.quantity);
  const producedQuantity = craftCount * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - quantity);

  const children: RecipeTreeNode[] = recipe.ingredients.map(ing => {
    const requiredForIngredient = craftCount * ing.quantity;
    return buildRecipeTree(ing.itemId, requiredForIngredient, currentVisited);
  });

  return {
    itemId,
    displayName,
    totalQuantity: quantity,
    stacks,
    isLeaf: false,
    recipe,
    craftCount,
    producedQuantity,
    extraQuantity,
    children,
  };
}
