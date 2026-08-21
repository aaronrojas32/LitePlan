import { describe, it, expect } from 'vitest';
import {
  calculateContainerBreakdown,
  calculateItemQuantity,
  formatStacks,
  formatStacksCompact,
  formatStacksWithUnit,
  formatShulkersCompact,
  formatDoubleChestsCompact,
  calculateRequiredContainers,
} from '../lib/minecraft/storageCalculator';

describe('Storage & Multi-Container Quantity Calculator (Issue #26)', () => {
  describe('Standard 64-Stack Items (e.g. Cobblestone, Stone, Planks)', () => {
    it('calculates 0 items correctly', () => {
      const breakdown = calculateContainerBreakdown(0, 64);
      expect(breakdown.items).toBe(0);
      expect(breakdown.fullStacks).toBe(0);
      expect(breakdown.remainderItems).toBe(0);
      expect(breakdown.fullShulkers).toBe(0);
      expect(breakdown.fullDoubleChests).toBe(0);
      expect(breakdown.shulkersRequired).toBe(0);
      expect(breakdown.doubleChestsRequired).toBe(0);
      expect(breakdown.stacksFormatted).toBe('0 items');
      expect(breakdown.stacksCompact).toBe('0');
      expect(breakdown.shulkerCompact).toBe('0 SB');
    });

    it('calculates single items and loose remainder', () => {
      const breakdown = calculateContainerBreakdown(32, 64);
      expect(breakdown.items).toBe(32);
      expect(breakdown.fullStacks).toBe(0);
      expect(breakdown.remainderItems).toBe(32);
      expect(breakdown.stacksFormatted).toBe('32 items');
      expect(breakdown.stacksCompact).toBe('32');
      expect(breakdown.shulkersRequired).toBe(1);
      expect(breakdown.doubleChestsRequired).toBe(1);
    });

    it('calculates exact 1 stack (64 items)', () => {
      const breakdown = calculateContainerBreakdown(64, 64);
      expect(breakdown.items).toBe(64);
      expect(breakdown.fullStacks).toBe(1);
      expect(breakdown.remainderItems).toBe(0);
      expect(breakdown.stacksFormatted).toBe('1 stack');
      expect(breakdown.stacksCompact).toBe('1');
      expect(breakdown.stacksWithUnit).toBe('1s');
      expect(breakdown.shulkersRequired).toBe(1);
    });

    it('calculates 1 stack + 1 item (65 items)', () => {
      const breakdown = calculateContainerBreakdown(65, 64);
      expect(breakdown.items).toBe(65);
      expect(breakdown.fullStacks).toBe(1);
      expect(breakdown.remainderItems).toBe(1);
      expect(breakdown.stacksFormatted).toBe('1 stack + 1');
      expect(breakdown.stacksCompact).toBe('1 + 1');
      expect(breakdown.stacksWithUnit).toBe('1s 1');
    });

    it('calculates exact 1 Shulker Box (27 stacks = 1,728 items)', () => {
      const breakdown = calculateContainerBreakdown(1728, 64);
      expect(breakdown.items).toBe(1728);
      expect(breakdown.fullStacks).toBe(27);
      expect(breakdown.remainderItems).toBe(0);
      expect(breakdown.fullShulkers).toBe(1);
      expect(breakdown.remainderShulkerStacks).toBe(0);
      expect(breakdown.remainderShulkerItems).toBe(0);
      expect(breakdown.shulkersRequired).toBe(1);
      expect(breakdown.shulkerCompact).toBe('1 SB');
      expect(breakdown.shulkerDetailed).toBe('1 Shulker');
    });

    it('calculates 1 Shulker Box + 1 Stack (1,792 items)', () => {
      const breakdown = calculateContainerBreakdown(1792, 64);
      expect(breakdown.items).toBe(1792);
      expect(breakdown.fullStacks).toBe(28);
      expect(breakdown.fullShulkers).toBe(1);
      expect(breakdown.remainderShulkerStacks).toBe(1);
      expect(breakdown.shulkersRequired).toBe(2);
      expect(breakdown.shulkerCompact).toBe('1 SB + 1s');
      expect(breakdown.shulkerDetailed).toBe('1 Shulker + 1 stack');
    });

    it('calculates exact 1 Double Chest (54 stacks = 3,456 items)', () => {
      const breakdown = calculateContainerBreakdown(3456, 64);
      expect(breakdown.items).toBe(3456);
      expect(breakdown.fullStacks).toBe(54);
      expect(breakdown.fullShulkers).toBe(2);
      expect(breakdown.fullDoubleChests).toBe(1);
      expect(breakdown.doubleChestsRequired).toBe(1);
      expect(breakdown.doubleChestCompact).toBe('1 DC');
      expect(breakdown.doubleChestDetailed).toBe('1 Double Chest');
    });

    it('calculates large volume: 4,800 blocks (75 stacks = 2 SB + 21s)', () => {
      const breakdown = calculateContainerBreakdown(4800, 64);
      expect(breakdown.items).toBe(4800);
      expect(breakdown.fullStacks).toBe(75);
      expect(breakdown.remainderItems).toBe(0);
      expect(breakdown.fullShulkers).toBe(2);
      expect(breakdown.remainderShulkerStacks).toBe(21);
      expect(breakdown.shulkersRequired).toBe(3);
      expect(breakdown.fullDoubleChests).toBe(1);
      expect(breakdown.doubleChestsRequired).toBe(2);
      expect(breakdown.stacksCompact).toBe('75');
      expect(breakdown.stacksWithUnit).toBe('75s');
      expect(breakdown.shulkerCompact).toBe('2 SB + 21s');
      expect(breakdown.shulkerDetailed).toBe('2 Shulkers + 21 stacks');
      expect(breakdown.doubleChestCompact).toBe('1 DC + 21s');
    });
  });

  describe('Special 16-Stack Items (e.g. Ender Pearls, Snowballs, Signs, Buckets)', () => {
    it('calculates 16 items as 1 stack', () => {
      const breakdown = calculateContainerBreakdown(16, 16);
      expect(breakdown.items).toBe(16);
      expect(breakdown.stackSize).toBe(16);
      expect(breakdown.fullStacks).toBe(1);
      expect(breakdown.remainderItems).toBe(0);
      expect(breakdown.stacksFormatted).toBe('1 stack');
      expect(breakdown.stacksCompact).toBe('1');
      expect(breakdown.stacksWithUnit).toBe('1s');
    });

    it('calculates 1 Shulker of 16-stack items (27 * 16 = 432 items)', () => {
      const breakdown = calculateContainerBreakdown(432, 16);
      expect(breakdown.items).toBe(432);
      expect(breakdown.fullStacks).toBe(27);
      expect(breakdown.fullShulkers).toBe(1);
      expect(breakdown.shulkerCapacity).toBe(432);
      expect(breakdown.shulkersRequired).toBe(1);
      expect(breakdown.shulkerCompact).toBe('1 SB');
    });

    it('calculates 1 Double Chest of 16-stack items (54 * 16 = 864 items)', () => {
      const breakdown = calculateContainerBreakdown(864, 16);
      expect(breakdown.items).toBe(864);
      expect(breakdown.fullStacks).toBe(54);
      expect(breakdown.fullDoubleChests).toBe(1);
      expect(breakdown.doubleChestCapacity).toBe(864);
      expect(breakdown.doubleChestsRequired).toBe(1);
      expect(breakdown.doubleChestCompact).toBe('1 DC');
    });
  });

  describe('Non-Stackable 1-Stack Items (e.g. Armor, Tools, Shulker Boxes)', () => {
    it('calculates 1 item as 1 item', () => {
      const breakdown = calculateContainerBreakdown(1, 1);
      expect(breakdown.items).toBe(1);
      expect(breakdown.fullStacks).toBe(1);
      expect(breakdown.stacksFormatted).toBe('1 item');
    });

    it('calculates 27 non-stackables as 1 Shulker Box', () => {
      const breakdown = calculateContainerBreakdown(27, 1);
      expect(breakdown.items).toBe(27);
      expect(breakdown.fullShulkers).toBe(1);
      expect(breakdown.shulkerCapacity).toBe(27);
      expect(breakdown.shulkerCompact).toBe('1 SB');
    });

    it('calculates 54 non-stackables as 1 Double Chest', () => {
      const breakdown = calculateContainerBreakdown(54, 1);
      expect(breakdown.items).toBe(54);
      expect(breakdown.fullDoubleChests).toBe(1);
      expect(breakdown.doubleChestCapacity).toBe(54);
      expect(breakdown.doubleChestCompact).toBe('1 DC');
    });
  });

  describe('Helper Formatting Functions & calculateItemQuantity', () => {
    it('formats stacks correctly for large numbers with commas', () => {
      expect(formatStacks(100000, 64)).toContain('1,562 stacks + 32');
      expect(formatStacksCompact(100000, 64)).toBe('1,562 + 32');
      expect(formatStacksWithUnit(100000, 64)).toBe('1,562s 32');
    });

    it('formats shulkers compact correctly', () => {
      expect(formatShulkersCompact(1728, 64)).toBe('1 SB');
      expect(formatShulkersCompact(3456, 64)).toBe('2 SB');
      expect(formatShulkersCompact(4800, 64)).toBe('2 SB + 21s');
    });

    it('formats double chests compact correctly', () => {
      expect(formatDoubleChestsCompact(3456, 64)).toBe('1 DC');
      expect(formatDoubleChestsCompact(6912, 64)).toBe('2 DC');
      expect(formatDoubleChestsCompact(4800, 64)).toBe('1 DC + 21s');
    });

    it('calculateItemQuantity returns both breakdown and storage text properties', () => {
      const q = calculateItemQuantity(4800, 64);
      expect(q.items).toBe(4800);
      expect(q.shulkersRequired).toBe(3);
      expect(q.doubleChestsRequired).toBe(2);
      expect(q.shulkerStorageText).toBe('3 Shulkers required');
      expect(q.doubleChestStorageText).toBe('2 Double Chests required');

      const containers = calculateRequiredContainers(4800, 64);
      expect(containers.shulkersRequired).toBe(3);
      expect(containers.doubleChestsRequired).toBe(2);
    });
  });
});
