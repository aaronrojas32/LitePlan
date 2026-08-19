import { RECIPES_DATABASE } from '../../data/recipesDatabase';
import { Recipe } from '../../types/recipe';

export function getRecipeForItem(itemId: string): Recipe | undefined {
  return RECIPES_DATABASE[itemId];
}

export function isCraftable(itemId: string): boolean {
  return itemId in RECIPES_DATABASE;
}

export function getAllRecipes(): Recipe[] {
  return Object.values(RECIPES_DATABASE);
}
