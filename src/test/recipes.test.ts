import { describe, it, expect } from 'vitest';
import { generateCraftingList } from '../lib/calculations/recipeCalculator';
import { calculateRawMaterials } from '../lib/calculations/rawMaterialCalculator';
import { getRecipeForItem, isCraftable } from '../lib/recipes/recipeDatabase';

describe('Recipes & Crafting Tree Calculator Test Suite', () => {
  describe('Database Lookup & Verification', () => {
    it('finds recipes for common crafting items', () => {
      expect(isCraftable('minecraft:piston')).toBe(true);
      expect(isCraftable('minecraft:repeater')).toBe(true);
      expect(isCraftable('minecraft:observer')).toBe(true);
      expect(isCraftable('minecraft:oak_planks')).toBe(true);
    });

    it('returns null or false for base raw items without recipes', () => {
      expect(isCraftable('minecraft:dirt')).toBe(false);
      expect(isCraftable('minecraft:bedrock')).toBe(false);
      expect(getRecipeForItem('minecraft:dirt')).toBeUndefined();
    });
  });

  describe('Crafting Steps & Surplus Extra Calculations', () => {
    it('calculates 10 Oak Planks -> 3 crafts of 4 (12 produced, 2 extra surplus)', () => {
      const materials = [
        {
          id: 'minecraft:oak_planks',
          minecraftId: 'minecraft:oak_planks',
          displayName: 'Oak Planks',
          category: 'wood' as const,
          stackSize: 64,
          totalRequired: 10,
          owned: 0,
          missing: 10,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const steps = generateCraftingList(materials as any, {});
      const plankStep = steps.find(s => s.outputItemId === 'minecraft:oak_planks');
      
      expect(plankStep).toBeDefined();
      expect(plankStep?.craftsNeeded).toBe(3); // 3 * 4 = 12 >= 10
      expect(plankStep?.producedQuantity).toBe(12);
      expect(plankStep?.extraQuantity).toBe(2);
    });

    it('calculates exact crafts for 16 Oak Planks -> 4 crafts of 4 (0 extra)', () => {
      const materials = [
        {
          id: 'minecraft:oak_planks',
          minecraftId: 'minecraft:oak_planks',
          displayName: 'Oak Planks',
          category: 'wood' as const,
          stackSize: 64,
          totalRequired: 16,
          owned: 0,
          missing: 16,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const steps = generateCraftingList(materials as any, {});
      const plankStep = steps.find(s => s.outputItemId === 'minecraft:oak_planks');

      expect(plankStep).toBeDefined();
      expect(plankStep?.craftsNeeded).toBe(4);
      expect(plankStep?.producedQuantity).toBe(16);
      expect(plankStep?.extraQuantity).toBe(0);
    });
  });

  describe('Craftable with Raw Resources Availability', () => {
    it('computes craftableWithRaw based on owned raw ingredients', () => {
      const materials = [
        {
          id: 'minecraft:piston',
          minecraftId: 'minecraft:piston',
          displayName: 'Piston',
          category: 'redstone' as const,
          stackSize: 64,
          totalRequired: 10,
          owned: 0,
          missing: 10,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      // Piston requires: 1 iron_ingot, 4 cobblestone, 3 oak_planks, 1 redstone
      // Suppose user has 5 iron ingots, 100 cobble, 100 planks, 100 redstone -> can craft 5 pistons
      const rawOwnedMap = {
        'minecraft:iron_ingot': 5,
        'minecraft:cobblestone': 100,
        'minecraft:oak_planks': 100,
        'minecraft:redstone': 100,
      };

      const steps = generateCraftingList(materials as any, rawOwnedMap);
      const pistonStep = steps.find(s => s.outputItemId === 'minecraft:piston');

      expect(pistonStep).toBeDefined();
      expect(pistonStep?.craftableWithRaw).toBe(5);
    });
  });

  describe('Recursive Raw Material Leaves', () => {
    it('breaks down complex redstone builds into base raw harvestable resources', () => {
      const materials = [
        {
          id: 'minecraft:observer',
          minecraftId: 'minecraft:observer',
          displayName: 'Observer',
          category: 'redstone' as const,
          stackSize: 64,
          totalRequired: 10,
          owned: 0,
          missing: 10,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      // Observer: 6 Cobblestone, 2 Redstone, 1 Quartz
      const raw = calculateRawMaterials(materials as any, {});
      
      const cobble = raw.find(r => r.itemId === 'minecraft:cobblestone');
      const redstone = raw.find(r => r.itemId === 'minecraft:redstone');
      const quartz = raw.find(r => r.itemId === 'minecraft:quartz');

      expect(cobble?.quantity).toBe(60);
      expect(redstone?.quantity).toBe(20);
      expect(quartz?.quantity).toBe(10);
    });
  });
});
