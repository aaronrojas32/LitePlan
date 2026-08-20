import { describe, it, expect } from 'vitest';
import { calculateRawMaterials } from '../lib/calculations/rawMaterialCalculator';
import { MATERIALS_DATABASE } from '../data/materialsDatabase';

describe('Multi-Tier Recipe Chain Audit & Validation Suite', () => {
  function testDecomposition(targetId: string, quantity: number, expectedRaws: Record<string, number>) {
    const materials = [
      {
        id: targetId,
        minecraftId: targetId,
        displayName: MATERIALS_DATABASE[targetId]?.displayNameEs || targetId,
        category: 'stone' as const,
        stackSize: 64,
        totalRequired: quantity,
        owned: 0,
        missing: quantity,
        available: 0,
        craftable: true,
        isRaw: false,
      },
    ];

    const rawResults = calculateRawMaterials(materials as any);
    const rawMap: Record<string, number> = {};
    for (const r of rawResults) {
      rawMap[r.itemId] = r.quantity;
    }

    for (const [expectedRawId, expectedQty] of Object.entries(expectedRaws)) {
      expect(rawMap[expectedRawId], `Expected ${expectedRawId} for ${targetId}`).toBe(expectedQty);
    }
  }

  // 1. Polished & Synthetic Stones Chains
  describe('1. Polished & Synthetic Stones Multi-Level Chains', () => {
    it('decomposes Polished Diorite -> Diorite -> Cobblestone + Quartz', () => {
      testDecomposition('minecraft:polished_diorite', 4, {
        'minecraft:cobblestone': 4,
        'minecraft:quartz': 4,
      });
    });

    it('decomposes Polished Andesite -> Andesite -> Diorite + Cobblestone -> Cobblestone + Quartz', () => {
      testDecomposition('minecraft:polished_andesite', 4, {
        'minecraft:cobblestone': 4,
        'minecraft:quartz': 2,
      });
    });

    it('decomposes Polished Granite -> Granite -> Diorite + Quartz -> Cobblestone + Quartz', () => {
      testDecomposition('minecraft:polished_granite', 4, {
        'minecraft:cobblestone': 4,
        'minecraft:quartz': 8,
      });
    });

    it('decomposes Diorite Stairs -> Diorite -> Cobblestone + Quartz', () => {
      // 4 Diorite Stairs = 6 Diorite = 3 crafts = 6 Cobblestone + 6 Quartz
      testDecomposition('minecraft:diorite_stairs', 4, {
        'minecraft:cobblestone': 6,
        'minecraft:quartz': 6,
      });
    });

    it('decomposes Polished Diorite Stairs -> Polished Diorite -> Diorite -> Cobblestone + Quartz', () => {
      // 4 Polished Diorite Stairs = 6 Polished Diorite = 2 crafts of 4 = 8 Diorite = 4 crafts = 8 Cobblestone + 8 Quartz
      testDecomposition('minecraft:polished_diorite_stairs', 4, {
        'minecraft:cobblestone': 8,
        'minecraft:quartz': 8,
      });
    });
  });

  // 2. Stone Bricks & Baked Stone Chains
  describe('2. Baked Stone & Stone Bricks Multi-Level Chains', () => {
    it('decomposes Stone Bricks -> Stone -> Cobblestone', () => {
      testDecomposition('minecraft:stone_bricks', 4, {
        'minecraft:cobblestone': 4,
      });
    });

    it('decomposes Stone Brick Stairs -> Stone Bricks -> Stone -> Cobblestone', () => {
      // 4 Stone Brick Stairs = 6 Stone Bricks = 2 crafts of 4 = 8 Stone = 8 Cobblestone
      testDecomposition('minecraft:stone_brick_stairs', 4, {
        'minecraft:cobblestone': 8,
      });
    });

    it('decomposes Smooth Stone Slab -> Smooth Stone -> Stone -> Cobblestone', () => {
      testDecomposition('minecraft:smooth_stone_slab', 6, {
        'minecraft:cobblestone': 3,
      });
    });

    it('decomposes Chiseled Stone Bricks -> Stone Brick Slabs -> Stone Bricks -> Stone -> Cobblestone', () => {
      // 1 Chiseled Stone Bricks = 2 Slabs (1 craft of 6 slabs = 3 stone bricks = 1 craft of 4 stone bricks = 4 stone = 4 cobble)
      testDecomposition('minecraft:chiseled_stone_bricks', 1, {
        'minecraft:cobblestone': 4,
      });
    });
  });

  // 3. Bricks & Clay Chains
  describe('3. Bricks & Clay Multi-Level Chains', () => {
    it('decomposes Bricks (Block) -> 4 Brick Item -> 4 Clay Ball', () => {
      testDecomposition('minecraft:bricks', 1, {
        'minecraft:clay_ball': 4,
      });
    });

    it('decomposes Brick Stairs -> Bricks Block -> Brick Item -> Clay Ball', () => {
      // 4 Brick Stairs = 6 Bricks Block = 6 crafts of 4 bricks = 24 Brick item = 24 Clay Ball
      testDecomposition('minecraft:brick_stairs', 4, {
        'minecraft:clay_ball': 24,
      });
    });

    it('decomposes Flower Pot -> 3 Brick Item -> 3 Clay Ball', () => {
      testDecomposition('minecraft:flower_pot', 1, {
        'minecraft:clay_ball': 3,
      });
    });
  });

  // 4. Nether Bricks & Blackstone Chains
  describe('4. Nether Bricks & Blackstone Multi-Level Chains', () => {
    it('decomposes Nether Bricks (Block) -> 4 Nether Brick Item -> 4 Netherrack', () => {
      testDecomposition('minecraft:nether_bricks', 1, {
        'minecraft:netherrack': 4,
      });
    });

    it('decomposes Nether Brick Stairs -> Nether Bricks Block -> Nether Brick Item -> Netherrack', () => {
      testDecomposition('minecraft:nether_brick_stairs', 4, {
        'minecraft:netherrack': 24,
      });
    });

    it('decomposes Polished Blackstone Bricks -> Polished Blackstone -> Blackstone', () => {
      testDecomposition('minecraft:polished_blackstone_bricks', 4, {
        'minecraft:blackstone': 4,
      });
    });

    it('decomposes Polished Blackstone Brick Stairs -> Polished Blackstone Bricks -> Polished Blackstone -> Blackstone', () => {
      // 4 stairs = 6 polished blackstone bricks = 2 crafts of 4 = 8 polished blackstone = 8 blackstone
      testDecomposition('minecraft:polished_blackstone_brick_stairs', 4, {
        'minecraft:blackstone': 8,
      });
    });
  });

  // 5. Redstone & Mechanics Chains
  describe('5. Redstone & Mechanics Multi-Level Chains', () => {
    it('decomposes Piston -> Planks (Logs) + Cobble + Iron (Raw Iron) + Redstone', () => {
      testDecomposition('minecraft:piston', 1, {
        'minecraft:oak_log': 1,
        'minecraft:cobblestone': 4,
        'minecraft:raw_iron': 1,
        'minecraft:redstone': 1,
      });
    });

    it('decomposes Sticky Piston -> Piston -> Planks (Logs) + Cobble + Iron + Redstone + Slime Ball', () => {
      testDecomposition('minecraft:sticky_piston', 1, {
        'minecraft:oak_log': 1,
        'minecraft:cobblestone': 4,
        'minecraft:raw_iron': 1,
        'minecraft:redstone': 1,
        'minecraft:slime_ball': 1,
      });
    });

    it('decomposes Blast Furnace -> Iron (Raw Iron) + Furnace (Cobble) + Smooth Stone (Stone -> Cobble)', () => {
      testDecomposition('minecraft:blast_furnace', 1, {
        'minecraft:raw_iron': 5,
        'minecraft:cobblestone': 11,
      });
    });

    it('decomposes Crafter -> Iron + Crafting Table (Logs) + Dropper (Cobble + Redstone) + Redstone', () => {
      testDecomposition('minecraft:crafter', 1, {
        'minecraft:raw_iron': 5,
        'minecraft:oak_log': 1,
        'minecraft:cobblestone': 7,
        'minecraft:redstone': 3,
      });
    });

    it('decomposes Hopper -> Iron (Raw Iron) + Chest (Planks from Logs)', () => {
      testDecomposition('minecraft:hopper', 1, {
        'minecraft:raw_iron': 5,
        'minecraft:oak_log': 2,
      });
    });
  });
});
