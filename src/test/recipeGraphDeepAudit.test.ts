import { describe, it, expect } from 'vitest';
import { getAllRecipes, getRecipeForItem } from '../data/minecraft/recipes';
import { resolveRecipeTree } from '../lib/calculations/recipeResolutionEngine';

describe('Deep Graph Audit of All Multi-Tier Crafting Chains', () => {
  const allRecipes = getAllRecipes();

  it('contains valid recipe definitions with defined outputs and ingredients', () => {
    expect(allRecipes.length).toBeGreaterThan(100);
    for (const r of allRecipes) {
      expect(r.output.itemId, `Recipe ${r.id} missing output itemId`).toBeDefined();
      expect(r.output.quantity, `Recipe ${r.id} output quantity must be > 0`).toBeGreaterThan(0);
      expect(r.ingredients.length, `Recipe ${r.id} must have ingredients`).toBeGreaterThan(0);
      for (const ing of r.ingredients) {
        expect(ing.itemId, `Recipe ${r.id} has undefined ingredient itemId`).toBeDefined();
        expect(ing.quantity, `Recipe ${r.id} ingredient ${ing.itemId} quantity must be > 0`).toBeGreaterThan(0);
      }
    }
  });

  it('verifies that every recipe in the entire database resolves down to terminal raw materials without errors', () => {
    const brokenChains: Array<{ outputId: string; missingIngredients: string[] }> = [];

    for (const recipe of allRecipes) {
      const outputId = recipe.output.itemId;
      try {
        const resolved = resolveRecipeTree(outputId, recipe.output.quantity);
        expect(resolved).toBeDefined();
        expect(resolved.itemId).toBe(outputId);
      } catch (err: any) {
        brokenChains.push({ outputId, missingIngredients: [err.message] });
      }
    }

    expect(brokenChains).toEqual([]);
  });

  it('detects and lists all intermediate recipes (where ingredient is craftable)', () => {
    const intermediateRecipes: Array<{ id: string; output: string; craftableIngredients: string[] }> = [];

    for (const r of allRecipes) {
      const craftableIngs = r.ingredients
        .map((ing) => ing.itemId)
        .filter((ingId) => Boolean(getRecipeForItem(ingId)));

      if (craftableIngs.length > 0) {
        intermediateRecipes.push({
          id: r.id,
          output: r.output.itemId,
          craftableIngredients: craftableIngs,
        });
      }
    }

    console.log(`Found ${intermediateRecipes.length} multi-tier recipes in database.`);
    expect(intermediateRecipes.length).toBeGreaterThan(30);
  });
});
