import { Recipe, RecipeType } from './types';
import { WOOD_RECIPES } from './woodRecipes';
import { STONE_RECIPES } from './stoneRecipes';
import { METAL_ORE_RECIPES } from './metalOreRecipes';
import { REDSTONE_RECIPES } from './redstoneRecipes';
import { DECORATION_RECIPES } from './decorationRecipes';
import { UTILITY_RECIPES } from './utilityRecipes';

export * from './types';

// Aggregate all modular recipe collections
export const ALL_MINECRAFT_RECIPES: Recipe[] = [
  ...WOOD_RECIPES,
  ...STONE_RECIPES,
  ...METAL_ORE_RECIPES,
  ...REDSTONE_RECIPES,
  ...DECORATION_RECIPES,
  ...UTILITY_RECIPES,
];

// Fast multi-map lookup indexed by output itemId
const RECIPES_BY_OUTPUT = new Map<string, Recipe[]>();

for (const recipe of ALL_MINECRAFT_RECIPES) {
  const outputId = recipe.output.itemId;
  const existing = RECIPES_BY_OUTPUT.get(outputId) || [];
  existing.push(recipe);
  RECIPES_BY_OUTPUT.set(outputId, existing);
}

// Strategy interface for deterministic recipe selection
export interface RecipeSelectionOptions {
  allowSmelting?: boolean;
  preferStonecutter?: boolean;
  preferredType?: RecipeType;
}

/**
 * Retrieves the preferred deterministic recipe for an item
 */
export function getRecipeForItem(
  itemId: string,
  options: RecipeSelectionOptions = { allowSmelting: true }
): Recipe | undefined {
  const candidates = RECIPES_BY_OUTPUT.get(itemId);
  if (!candidates || candidates.length === 0) return undefined;

  // Filter candidates based on options
  const filtered = candidates.filter((r) => {
    if (options.allowSmelting === false && r.type === 'smelting') return false;
    if (options.preferredType && r.type === options.preferredType) return true;
    return true;
  });

  if (filtered.length === 0) return undefined;

  // Sort by priority descending, then isDefault descending
  filtered.sort((a, b) => {
    if (options.preferStonecutter) {
      if (a.type === 'stonecutting' && b.type !== 'stonecutting') return -1;
      if (b.type === 'stonecutting' && a.type !== 'stonecutting') return 1;
    }
    const priorityA = a.priority ?? 50;
    const priorityB = b.priority ?? 50;
    if (priorityB !== priorityA) return priorityB - priorityA;
    if (a.isDefault && !b.isDefault) return -1;
    if (b.isDefault && !a.isDefault) return 1;
    return 0;
  });

  return filtered[0];
}

/**
 * Retrieves all valid alternative recipes for an item
 */
export function getAllRecipesForItem(itemId: string): Recipe[] {
  return RECIPES_BY_OUTPUT.get(itemId) || [];
}

/**
 * Returns true if an item can be produced via crafting, smelting, or processing
 */
export function isCraftable(itemId: string, options?: RecipeSelectionOptions): boolean {
  return getRecipeForItem(itemId, options) !== undefined;
}

/**
 * Returns all recipes in the active database
 */
export function getAllRecipes(): Recipe[] {
  return ALL_MINECRAFT_RECIPES;
}

// Re-export compatible RECIPES_DATABASE map for backward compatibility
export const RECIPES_DATABASE: Record<string, Recipe> = {};
for (const itemId of RECIPES_BY_OUTPUT.keys()) {
  const primary = getRecipeForItem(itemId);
  if (primary) {
    RECIPES_DATABASE[itemId] = primary;
  }
}
