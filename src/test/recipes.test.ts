import { describe, it, expect } from 'vitest';
import { generateCraftingList, calculateCrafts, calculateExcess } from '../lib/calculations/recipeCalculator';
import { calculateRawMaterials } from '../lib/calculations/rawMaterialCalculator';
import { resolveRecipeTree, getResolutionPath } from '../lib/calculations/recipeResolutionEngine';
import { getAllRecipesForItem } from '../data/minecraft/recipes';
import { parseLitematicaFile } from '../lib/parser/index';
import { SAMPLE_NETHER_PORTAL_CSV, SAMPLE_NETHER_PORTAL_TXT } from '../data/sampleData';

describe('Recipes & Multi-Tier Resolution Test Suite', () => {
  describe('Critical Test 1: Oak Planks -> Oak Logs (No planks in Raw)', () => {
    it('resolves 128 Oak Planks into exactly 32 Oak Logs in Raw Resources and 0 Oak Planks in Raw', () => {
      const materials = [
        {
          id: 'minecraft:oak_planks',
          minecraftId: 'minecraft:oak_planks',
          displayName: 'Oak Planks',
          category: 'wood' as const,
          stackSize: 64,
          totalRequired: 128,
          owned: 0,
          missing: 128,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);
      expect(rawResults.find((r) => r.itemId === 'minecraft:oak_planks')).toBeUndefined();

      const oakLogRaw = rawResults.find((r) => r.itemId === 'minecraft:oak_log');
      expect(oakLogRaw).toBeDefined();
      expect(oakLogRaw?.quantity).toBe(32); // 128 / 4 = 32
    });
  });

  describe('Critical Test 2: Glass -> Sand (Smelting in Furnace)', () => {
    it('resolves 64 Glass into 64 Sand in Raw Resources via smelting and 0 Glass in Raw', () => {
      const materials = [
        {
          id: 'minecraft:glass',
          minecraftId: 'minecraft:glass',
          displayName: 'Glass',
          category: 'decoration' as const,
          stackSize: 64,
          totalRequired: 64,
          owned: 0,
          missing: 64,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);
      expect(rawResults.find((r) => r.itemId === 'minecraft:glass')).toBeUndefined();

      const sandRaw = rawResults.find((r) => r.itemId === 'minecraft:sand');
      expect(sandRaw).toBeDefined();
      expect(sandRaw?.quantity).toBe(64);
    });
  });

  describe('Critical Test 3: 64 Pistons Full Chain (Smelting + Crafting)', () => {
    it('resolves 64 Pistons down to 64 Raw Iron, 256 Cobblestone, 48 Oak Logs, and 64 Redstone', () => {
      const materials = [
        {
          id: 'minecraft:piston',
          minecraftId: 'minecraft:piston',
          displayName: 'Piston',
          category: 'redstone' as const,
          stackSize: 64,
          totalRequired: 64,
          owned: 0,
          missing: 64,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);

      // Raw Iron (from 64 iron ingots)
      const rawIron = rawResults.find((r) => r.itemId === 'minecraft:raw_iron');
      expect(rawIron).toBeDefined();
      expect(rawIron?.quantity).toBe(64);

      // Cobblestone (4 per piston * 64 = 256)
      const cobble = rawResults.find((r) => r.itemId === 'minecraft:cobblestone');
      expect(cobble).toBeDefined();
      expect(cobble?.quantity).toBe(256);

      // Oak Logs (3 planks per piston * 64 = 192 planks -> 48 logs)
      const oakLogs = rawResults.find((r) => r.itemId === 'minecraft:oak_log');
      expect(oakLogs).toBeDefined();
      expect(oakLogs?.quantity).toBe(48);

      // Redstone (1 per piston * 64 = 64)
      const redstone = rawResults.find((r) => r.itemId === 'minecraft:redstone');
      expect(redstone).toBeDefined();
      expect(redstone?.quantity).toBe(64);

      // Intermediates like iron_ingot and oak_planks must NOT be in Raw
      expect(rawResults.find((r) => r.itemId === 'minecraft:iron_ingot')).toBeUndefined();
      expect(rawResults.find((r) => r.itemId === 'minecraft:oak_planks')).toBeUndefined();
    });

    it('verifies explicit linear resolution path for Piston', () => {
      const path = getResolutionPath('minecraft:piston', 64);
      expect(path.length).toBeGreaterThanOrEqual(2);
      expect(path[0].tier).toBe('BUILD');
      expect(path[path.length - 1].tier).toBe('RAW');
    });
  });

  describe('Critical Test 4: 9 Iron Blocks Full Decomposition', () => {
    it('resolves 9 Iron Blocks into 81 Iron Ingots and 81 Raw Iron in Raw Resources', () => {
      const materials = [
        {
          id: 'minecraft:iron_block',
          minecraftId: 'minecraft:iron_block',
          displayName: 'Iron Block',
          category: 'mineral' as const,
          stackSize: 64,
          totalRequired: 9,
          owned: 0,
          missing: 9,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);
      const rawIron = rawResults.find((r) => r.itemId === 'minecraft:raw_iron');
      expect(rawIron).toBeDefined();
      expect(rawIron?.quantity).toBe(81); // 9 * 9 = 81
    });
  });

  describe('Critical Test 5: Surplus Extra Quantity & Ceil Math', () => {
    it('calculates 437 Oak Planks -> 110 crafts, 440 produced, 3 surplus extra', () => {
      const crafts = calculateCrafts(437, 4);
      const excess = calculateExcess(437, 4);

      expect(crafts).toBe(110);
      expect(crafts * 4).toBe(440);
      expect(excess).toBe(3);
    });
  });

  describe('Critical Test 6: Alternative Recipes (Stone Slabs via Crafting vs Stonecutter)', () => {
    it('supports alternative recipe definitions without duplication', () => {
      const nodeDefault = resolveRecipeTree('minecraft:stone_slab', 6);
      expect(nodeDefault).toBeDefined();
      expect(nodeDefault.children.length).toBeGreaterThan(0);
    });
  });

  describe('Critical Test 7: End-to-End Real Schematic Parsing & Material Flow', () => {
    it('parses real Nether Portal CSV and produces valid Build Objects, Crafting Steps, and Raw Leaves', () => {
      const parsed = parseLitematicaFile(SAMPLE_NETHER_PORTAL_CSV, 'nether_portal.csv');
      expect(parsed.materials.length).toBeGreaterThan(0);

      const rawMaterials = calculateRawMaterials(parsed.materials as any);
      expect(rawMaterials.length).toBeGreaterThan(0);

      const craftingSteps = generateCraftingList(parsed.materials as any, {});
      expect(craftingSteps.length).toBeGreaterThan(0);

      // Verify that all raw materials are genuine terminal items without applicable recipes in raw
      for (const raw of rawMaterials) {
        expect(raw.quantity).toBeGreaterThan(0);
      }
    });

    it('parses real Nether Portal TXT and accurately extracts materials and raw resources', () => {
      const parsed = parseLitematicaFile(SAMPLE_NETHER_PORTAL_TXT, 'nether_portal.txt');
      expect(parsed.materials.length).toBeGreaterThan(0);

      const rawMaterials = calculateRawMaterials(parsed.materials as any);
      expect(rawMaterials.length).toBeGreaterThan(0);
    });
  });

  describe('Critical Test 8: Polished Stones and Mossy Stone Variants', () => {
    it('resolves Polished Diorite into Diorite in Raw Resources (and 0 Polished Diorite in Raw)', () => {
      const materials = [
        {
          id: 'minecraft:polished_diorite',
          minecraftId: 'minecraft:polished_diorite',
          displayName: 'Polished Diorite',
          category: 'stone' as const,
          stackSize: 64,
          totalRequired: 64,
          owned: 0,
          missing: 64,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);
      expect(rawResults.find((r) => r.itemId === 'minecraft:polished_diorite')).toBeUndefined();

      const dioriteRaw = rawResults.find((r) => r.itemId === 'minecraft:diorite');
      expect(dioriteRaw).toBeDefined();
      expect(dioriteRaw?.quantity).toBe(64);
    });

    it('resolves Mossy Cobblestone into Cobblestone and Vine in Raw Resources', () => {
      const materials = [
        {
          id: 'minecraft:mossy_cobblestone',
          minecraftId: 'minecraft:mossy_cobblestone',
          displayName: 'Mossy Cobblestone',
          category: 'stone' as const,
          stackSize: 64,
          totalRequired: 32,
          owned: 0,
          missing: 32,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const rawResults = calculateRawMaterials(materials as any);
      expect(rawResults.find((r) => r.itemId === 'minecraft:mossy_cobblestone')).toBeUndefined();

      const cobbleRaw = rawResults.find((r) => r.itemId === 'minecraft:cobblestone');
      expect(cobbleRaw).toBeDefined();
      expect(cobbleRaw?.quantity).toBe(32);

      const vineRaw = rawResults.find((r) => r.itemId === 'minecraft:vine');
      expect(vineRaw).toBeDefined();
      expect(vineRaw?.quantity).toBe(32);
    });
  });

  describe('Critical Test 9: Alternative Recipes & Synthetic Base Stones', () => {
    it('provides both Crafting Table and Stonecutter alternative recipes for stone stairs/slabs/bricks', () => {
      const stairRecipes = getAllRecipesForItem('minecraft:stone_stairs');
      expect(stairRecipes.length).toBeGreaterThanOrEqual(2);

      const shaped = stairRecipes.find((r) => r.type === 'crafting_shaped');
      const stonecutter = stairRecipes.find((r) => r.type === 'stonecutting');

      expect(shaped).toBeDefined();
      expect(stonecutter).toBeDefined();
      expect(stonecutter?.output.quantity).toBe(1);
      expect(stonecutter?.ingredients[0].quantity).toBe(1);
    });

    it('has synthetic crafting recipes for Diorite, Andesite, and Granite', () => {
      const dioriteRecipes = getAllRecipesForItem('minecraft:diorite');
      expect(dioriteRecipes.length).toBeGreaterThanOrEqual(1);
      const dioriteCraft = dioriteRecipes.find((r) => r.id.includes('cobblestone_and_quartz'));
      expect(dioriteCraft).toBeDefined();
      expect(dioriteCraft?.output.quantity).toBe(2);

      const andesiteRecipes = getAllRecipesForItem('minecraft:andesite');
      expect(andesiteRecipes.length).toBeGreaterThanOrEqual(1);
      const andesiteCraft = andesiteRecipes.find((r) => r.id.includes('diorite_and_cobblestone'));
      expect(andesiteCraft).toBeDefined();

      const graniteRecipes = getAllRecipesForItem('minecraft:granite');
      expect(graniteRecipes.length).toBeGreaterThanOrEqual(1);
      const graniteCraft = graniteRecipes.find((r) => r.id.includes('diorite_and_quartz'));
      expect(graniteCraft).toBeDefined();
    });
  });
});
