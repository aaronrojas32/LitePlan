import { describe, it, expect } from 'vitest';
import { getAllRecipes, getRecipeForItem, getAllRecipesForItem } from '../data/minecraft/recipes';
import { resolveRecipeTree } from '../lib/calculations/recipeResolutionEngine';

describe('Dataset Integrity & Recipe Validation (Minecraft 1.21)', () => {
  const allRecipes = getAllRecipes();

  it('should load all recipes without duplicate IDs', () => {
    expect(allRecipes.length).toBeGreaterThan(50);
    const seenIds = new Set<string>();

    for (const recipe of allRecipes) {
      expect(recipe.id).toBeDefined();
      expect(recipe.id.length).toBeGreaterThan(0);
      expect(seenIds.has(recipe.id)).toBe(false);
      seenIds.add(recipe.id);
    }
  });

  it('should have valid output and positive quantities for all recipes', () => {
    for (const recipe of allRecipes) {
      expect(recipe.output).toBeDefined();
      expect(recipe.output.itemId).toBeDefined();
      expect(recipe.output.itemId.startsWith('minecraft:')).toBe(true);
      expect(recipe.output.quantity).toBeGreaterThan(0);
      expect(Number.isInteger(recipe.output.quantity)).toBe(true);
    }
  });

  it('should have valid ingredients with positive quantities for all recipes', () => {
    for (const recipe of allRecipes) {
      expect(recipe.ingredients).toBeDefined();
      expect(recipe.ingredients.length).toBeGreaterThan(0);

      for (const ing of recipe.ingredients) {
        expect(ing.itemId).toBeDefined();
        expect(ing.itemId.startsWith('minecraft:')).toBe(true);
        expect(ing.quantity).toBeGreaterThan(0);
        expect(Number.isInteger(ing.quantity)).toBe(true);
      }
    }
  });

  it('should have correct recipe types', () => {
    const validTypes = new Set([
      'crafting_shaped',
      'crafting_shapeless',
      'crafting',
      'smelting',
      'blasting',
      'smoking',
      'stonecutting',
      'smithing',
      'campfire_cooking',
      'brewing',
    ]);

    for (const recipe of allRecipes) {
      expect(validTypes.has(recipe.type)).toBe(true);
    }
  });

  it('should resolve every recipe output in the dataset without circular infinite loops', () => {
    for (const recipe of allRecipes) {
      const outputItemId = recipe.output.itemId;
      // Resolve 100 units of each item
      const resolved = resolveRecipeTree(outputItemId, 100);
      expect(resolved).toBeDefined();
      expect(resolved.itemId).toBe(outputItemId);
      expect(resolved.quantity).toBe(100);
    }
  });

  it('should provide deterministic primary recipes and alternate recipes', () => {
    const oakStairsPrimary = getRecipeForItem('minecraft:oak_stairs');
    expect(oakStairsPrimary).toBeDefined();
    expect(oakStairsPrimary?.output.quantity).toBe(4);

    const stoneSlabAlternatives = getAllRecipesForItem('minecraft:stone_slab');
    expect(stoneSlabAlternatives.length).toBeGreaterThanOrEqual(2); // Crafting + Stonecutter
  });
});
