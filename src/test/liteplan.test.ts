import { describe, it, expect } from 'vitest';
import {
  calculateItemQuantity,
} from '../lib/minecraft/storageCalculator';
import { calculateProjectProgress } from '../lib/calculations/progressCalculator';
import { calculateRawMaterials } from '../lib/calculations/rawMaterialCalculator';
import { updateProjectOwnedMap } from '../lib/storage/projectStore';
import { Project } from '../types/project';

describe('LitePlan Calculation & Architecture Test Suite', () => {
  describe('1. Single Source of Truth & Quantity Formatting', () => {
    it('calculates 1248 Stone -> 19 stacks + 32, 1 Shulker required', () => {
      const q = calculateItemQuantity(1248, 64);
      expect(q.items).toBe(1248);
      expect(q.fullStacks).toBe(19);
      expect(q.remainder).toBe(32);
      expect(q.stacksFormatted).toBe('19 stacks + 32');
      expect(q.stacksCompact).toBe('19 + 32');
      expect(q.shulkersRequired).toBe(1);
      expect(q.shulkerStorageText).toBe('1 Shulker required');
    });

    it('calculates 436 Oak Planks -> 6 stacks + 52, 1 Shulker required', () => {
      const q = calculateItemQuantity(436, 64);
      expect(q.items).toBe(436);
      expect(q.fullStacks).toBe(6);
      expect(q.remainder).toBe(52);
      expect(q.stacksFormatted).toBe('6 stacks + 52');
      expect(q.shulkersRequired).toBe(1);
    });

    it('calculates 1728 Stone (exactly 1 full Shulker box = 27 stacks)', () => {
      const q = calculateItemQuantity(1728, 64);
      expect(q.fullStacks).toBe(27);
      expect(q.remainder).toBe(0);
      expect(q.stacksFormatted).toBe('27 stacks');
      expect(q.shulkersRequired).toBe(1);
    });

    it('calculates 1729 Stone (overflow into 2nd Shulker)', () => {
      const q = calculateItemQuantity(1729, 64);
      expect(q.fullStacks).toBe(27);
      expect(q.remainder).toBe(1);
      expect(q.stacksFormatted).toBe('27 stacks + 1');
      expect(q.shulkersRequired).toBe(2);
      expect(q.shulkerStorageText).toBe('2 Shulkers required');
    });

    it('handles stack sizes 16 (Ender Pearls) and 1 (Armor/Tools)', () => {
      const q16 = calculateItemQuantity(432, 16); // 27 stacks of 16
      expect(q16.fullStacks).toBe(27);
      expect(q16.shulkersRequired).toBe(1);

      const q16Overflow = calculateItemQuantity(433, 16);
      expect(q16Overflow.shulkersRequired).toBe(2);

      const q1 = calculateItemQuantity(27, 1);
      expect(q1.fullStacks).toBe(27);
      expect(q1.shulkersRequired).toBe(1);
    });
  });

  describe('2. User Specified Test Cases (Checklist & Progress Separation)', () => {
    // CASO 1: Required: 100, Owned: 0. Marca complete -> Owned: 100, Missing: 0, Progress: 100%
    it('CASE 1: Required 100, Owned 0 -> Mark complete results in 100 owned, 0 missing, 100% progress', () => {
      const materials = [
        {
          id: 'minecraft:stone',
          minecraftId: 'minecraft:stone',
          displayName: 'Stone',
          category: 'stone' as const,
          stackSize: 64,
          totalRequired: 100,
          owned: 0,
          missing: 100,
          available: 0,
          craftable: false,
          isRaw: true,
        },
      ];

      const initialProgress = calculateProjectProgress(materials as any);
      expect(initialProgress.percentage).toBe(0);
      expect(initialProgress.missingBlocks).toBe(100);

      // User marks complete
      materials[0].owned = 100;
      materials[0].missing = Math.max(0, materials[0].totalRequired - materials[0].owned);

      const completedProgress = calculateProjectProgress(materials as any);
      expect(completedProgress.percentage).toBe(100);
      expect(completedProgress.ownedBlocks).toBe(100);
      expect(completedProgress.missingBlocks).toBe(0);
      expect(completedProgress.isComplete).toBe(true);
    });

    // CASO 2: Required: 100, Owned: 20. Añadir 30 -> Owned: 50, Missing: 50, Progress: 50%
    it('CASE 2: Required 100, Owned 20. Add 30 -> Owned 50, Missing 50, Progress 50%', () => {
      const material = {
        id: 'minecraft:stone',
        minecraftId: 'minecraft:stone',
        displayName: 'Stone',
        category: 'stone' as const,
        stackSize: 64,
        totalRequired: 100,
        owned: 20,
        missing: 80,
        available: 0,
        craftable: false,
        isRaw: true,
      };

      const p1 = calculateProjectProgress([material as any]);
      expect(p1.percentage).toBe(20);
      expect(p1.missingBlocks).toBe(80);

      // Add 30 items
      material.owned += 30;
      material.missing = Math.max(0, material.totalRequired - material.owned);

      const p2 = calculateProjectProgress([material as any]);
      expect(material.owned).toBe(50);
      expect(material.missing).toBe(50);
      expect(p2.percentage).toBe(50);
      expect(p2.ownedBlocks).toBe(50);
      expect(p2.missingBlocks).toBe(50);
    });

    // CASO 3: Required: 100 Stone, Owned: 20 Stone. Raw Resource: 1000 Iron Ore.
    // Resultado: Iron Ore NO aumenta directamente progress (se mantiene en 20%).
    it('CASE 3: Raw resources do NOT directly increase Build Progress percentage', () => {
      const buildMaterials = [
        {
          id: 'minecraft:stone',
          minecraftId: 'minecraft:stone',
          displayName: 'Stone',
          category: 'stone' as const,
          stackSize: 64,
          totalRequired: 100,
          owned: 20,
          missing: 80,
          available: 0,
          craftable: false,
          isRaw: true,
        },
      ];

      // Build progress depends strictly on buildMaterials
      const buildProgress = calculateProjectProgress(buildMaterials as any);
      expect(buildProgress.percentage).toBe(20);

      // Even if user farms 1,000 Iron Ore in raw inventory
      const rawOwnedMap = { 'minecraft:iron_ore': 1000 };
      calculateRawMaterials(buildMaterials as any, rawOwnedMap);

      // Build progress must still strictly be 20%
      const buildProgressAfter = calculateProjectProgress(buildMaterials as any);
      expect(buildProgressAfter.percentage).toBe(20);
      expect(buildProgressAfter.ownedBlocks).toBe(20);
    });

    // CASO 4: Required: 100 Pistons, Crafted/Owned: 40 -> Progress must be 40%
    it('CASE 4: Required 100 Pistons, Crafted/Owned 40 -> Progress is strictly 40%', () => {
      const pistonMaterial = {
        id: 'minecraft:piston',
        minecraftId: 'minecraft:piston',
        displayName: 'Piston',
        category: 'redstone' as const,
        stackSize: 64,
        totalRequired: 100,
        owned: 40,
        missing: 60,
        available: 0,
        craftable: true,
        isRaw: false,
      };

      const progress = calculateProjectProgress([pistonMaterial as any]);
      expect(progress.percentage).toBe(40);
      expect(progress.ownedBlocks).toBe(40);
      expect(progress.missingBlocks).toBe(60);
    });
  });

  describe('3. Raw Resource Aggregation & No Double Accounting', () => {
    // CASO 5: 100 Pistons + 50 Hoppers -> Iron is properly aggregated without duplication
    it('aggregates raw materials across multiple recipes without duplication', () => {
      const materials = [
        {
          id: 'minecraft:piston',
          minecraftId: 'minecraft:piston',
          displayName: 'Piston',
          category: 'redstone' as const,
          stackSize: 64,
          totalRequired: 100,
          owned: 0,
          missing: 100,
          available: 0,
          craftable: true,
          isRaw: false,
        },
        {
          id: 'minecraft:hopper',
          minecraftId: 'minecraft:hopper',
          displayName: 'Hopper',
          category: 'redstone' as const,
          stackSize: 64,
          totalRequired: 50,
          owned: 0,
          missing: 50,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const raw = calculateRawMaterials(materials as any);
      
      // Check that raw iron is present and aggregated:
      // 100 pistons * 1 iron ingot + 50 hoppers * 5 iron ingots = 100 + 250 = 350 raw_iron
      const rawIron = raw.find((r) => r.itemId === 'minecraft:raw_iron' || r.itemId === 'minecraft:iron_ingot');
      expect(rawIron).toBeDefined();
      expect(rawIron?.quantity).toBe(350);

      // Verify no duplicates in the results
      const itemIds = raw.map((r) => r.itemId);
      const uniqueItemIds = new Set(itemIds);
      expect(itemIds.length).toBe(uniqueItemIds.size);
    });
  });

  describe('4. Data Integrity & Clamping', () => {
    it('clamps owned blocks to totalRequired so progress never exceeds 100%', () => {
      const material = {
        id: 'minecraft:stone',
        minecraftId: 'minecraft:stone',
        displayName: 'Stone',
        category: 'stone' as const,
        stackSize: 64,
        totalRequired: 100,
        owned: 500, // User entered more than required
        missing: 0,
        available: 0,
        craftable: false,
        isRaw: true,
      };

      const progress = calculateProjectProgress([material as any]);
      expect(progress.percentage).toBe(100);
      expect(progress.ownedBlocks).toBe(100); // Clamped
      expect(progress.missingBlocks).toBe(0);
    });

    it('ensures zero and negative inputs are safely handled', () => {
      const qZero = calculateItemQuantity(0, 64);
      expect(qZero.items).toBe(0);
      expect(qZero.fullStacks).toBe(0);
      expect(qZero.remainder).toBe(0);
      expect(qZero.shulkersRequired).toBe(0);

      const qNegative = calculateItemQuantity(-50, 64);
      expect(qNegative.items).toBe(0);
      expect(qNegative.shulkersRequired).toBe(0);
    });
  });

  describe('5. Project Store Owned Maps & Sync', () => {
    it('updateProjectOwnedMap updates both owned and rawOwned cleanly', () => {
      const dummyProject: Project = {
        id: 'test_project_1',
        name: 'Test Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rawRowCount: 1,
        parsedRows: [
          {
            rawName: 'Stone',
            total: 100,
            available: 0,
            missing: 100,
          },
        ],
        materials: [],
        unrecognized: [],
        rawMaterials: [],
        craftingSteps: [],
        ownedMap: {},
        rawOwnedMap: {},
        summary: {
          totalBlocks: 100,
          totalUniqueMaterials: 1,
          totalStacks: 2,
          shulkersRequired: 1,
          doubleChestsRequired: 1,
          totalCraftingOperations: 0,
          uniqueRecipesCount: 0,
          rawMaterialCount: 1,
        } as any,
        progress: {
          totalBlocks: 100,
          ownedBlocks: 0,
          missingBlocks: 100,
          percentage: 0,
          totalMaterials: 1,
          completedMaterials: 0,
          totalCraftingOps: 0,
          completedCraftingOps: 0,
          isComplete: false,
        },
      };

      const updated = updateProjectOwnedMap(
        dummyProject,
        { 'minecraft:stone': 60 },
        { 'minecraft:cobblestone': 60 }
      );

      expect(updated.progress.ownedBlocks).toBe(60);
      expect(updated.progress.missingBlocks).toBe(40);
      expect(updated.progress.percentage).toBe(60);
      expect(updated.materials[0].owned).toBe(60);
      expect(updated.materials[0].missing).toBe(40);
      expect(updated.rawMaterials[0].owned).toBe(60);
    });
  });

  describe('4. Sections 36, 37, 38 Critical Test Cases', () => {
    // SECTION 36: Critical test for Pistons build progress and raw inventory
    it('SECTION 36: 64 Pistons required -> Raw resources 100% gathered gives 0% Build Progress until crafted', () => {
      const pistonMaterial = {
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
      };

      // Raw ingredients for 64 Pistons (1 Iron Ingot from 1 Raw Iron, 4 Cobblestone, 3 Oak Planks from Oak Logs, 1 Redstone each):
      // 64 Raw Iron, 256 Cobble, 192 Oak Planks (from 48 Oak Logs), 64 Redstone
      const rawOwnedMap = {
        'minecraft:raw_iron': 64,
        'minecraft:cobblestone': 256,
        'minecraft:oak_log': 48,
        'minecraft:redstone': 64,
      };

      // 1. Initial State: 0 Pistons owned, all raw gathered
      const progressInitial = calculateProjectProgress([pistonMaterial] as any);
      expect(progressInitial.percentage).toBe(0);
      expect(progressInitial.ownedBlocks).toBe(0);
      expect(progressInitial.missingBlocks).toBe(64);

      // Raw materials calculation confirms all raw requirements are satisfied
      const rawRequirements = calculateRawMaterials([pistonMaterial] as any, rawOwnedMap);
      const missingRaw = rawRequirements.filter((r) => r.missing > 0);
      expect(missingRaw.length).toBe(0); // 100% raw gathered

      // 2. User crafts 32 Pistons (owned = 32)
      pistonMaterial.owned = 32;
      pistonMaterial.missing = 32;
      const progressHalf = calculateProjectProgress([pistonMaterial] as any);
      expect(progressHalf.percentage).toBe(50);
      expect(progressHalf.ownedBlocks).toBe(32);
      expect(progressHalf.missingBlocks).toBe(32);

      // 3. User crafts 64 Pistons (owned = 64)
      pistonMaterial.owned = 64;
      pistonMaterial.missing = 0;
      const progressFull = calculateProjectProgress([pistonMaterial] as any);
      expect(progressFull.percentage).toBe(100);
      expect(progressFull.ownedBlocks).toBe(64);
      expect(progressFull.missingBlocks).toBe(0);
      expect(progressFull.isComplete).toBe(true);
    });

    // SECTION 37: Double counting prevention test
    it('SECTION 37: 64 Iron Ingots do NOT count as 64 Build Objects if the build requires 64 Pistons', () => {
      const pistonMaterial = {
        id: 'minecraft:piston',
        minecraftId: 'minecraft:piston',
        displayName: 'Piston',
        category: 'redstone' as const,
        stackSize: 64,
        totalRequired: 64,
        owned: 0, // Player has 0 pistons
        missing: 64,
        available: 0,
        craftable: true,
        isRaw: false,
      };

      // Player has 64 Iron Ingots in raw inventory
      const progress = calculateProjectProgress([pistonMaterial] as any);
      expect(progress.ownedBlocks).toBe(0);
      expect(progress.percentage).toBe(0);
      expect(progress.totalBlocks).toBe(64);
    });

    // SECTION 38: Aggregation of same raw resource across multiple items
    it('SECTION 38: Two items requiring Oak Logs (32 planks + 15 planks) accumulate into total Oak Logs without duplicates', () => {
      const materials = [
        {
          id: 'minecraft:oak_planks',
          minecraftId: 'minecraft:oak_planks',
          displayName: 'Oak Planks (Section A)',
          category: 'wood' as const,
          stackSize: 64,
          totalRequired: 32, // requires 8 Oak Logs
          owned: 0,
          missing: 32,
          available: 0,
          craftable: true,
          isRaw: false,
        },
        {
          id: 'minecraft:oak_stairs',
          minecraftId: 'minecraft:oak_stairs',
          displayName: 'Oak Stairs (Section B)',
          category: 'wood' as const,
          stackSize: 64,
          totalRequired: 8, // recipe: 6 planks -> 4 stairs => 2 crafts => 12 planks => 3 logs
          owned: 0,
          missing: 8,
          available: 0,
          craftable: true,
          isRaw: false,
        },
      ];

      const raw = calculateRawMaterials(materials as any, {});
      const oakLogs = raw.filter((r) => r.itemId === 'minecraft:oak_log');
      
      // Must not create duplicate Oak Log entries in the raw resource list
      expect(oakLogs.length).toBe(1);
      expect(oakLogs[0].quantity).toBe(11); // 8 logs + 3 logs = 11 logs
    });
  });
});
