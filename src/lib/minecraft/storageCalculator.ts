/**
 * Centralized Minecraft Quantity and Storage Calculator
 * 
 * Rules:
 * 1. Base unit is ALWAYS raw items / blocks (integer).
 * 2. 1 Stack = stackSize (typically 64, 16 for pearls/buckets, 1 for tools/shulkers).
 * 3. 1 Shulker Box = 27 slots = 27 * stackSize items.
 * 4. 1 Double Chest = 54 slots = 54 * stackSize items.
 * 5. Full stacks = Math.floor(amount / stackSize).
 * 6. Remainder = amount % stackSize.
 * 7. Stacks required (slots needed) = Math.ceil(amount / stackSize).
 * 8. Shulkers required = Math.ceil(amount / (27 * stackSize)).
 * 9. Double Chests required = Math.ceil(amount / (54 * stackSize)).
 */

export interface ItemQuantityBreakdown {
  items: number;
  stackSize: number;
  fullStacks: number;
  remainder: number;
  stacksRequired: number; // Slots required in inventory/chest
  stacksFormatted: string; // e.g. "19 stacks + 32", "1 stack", "1 stack + 1", "32 items"
  stacksCompact: string; // e.g. "19 + 32", "1", "1 + 1", "32"
  shulkerCapacity: number; // 27 * stackSize
  shulkersRequired: number; // minimum physical shulker boxes needed
  doubleChestCapacity: number; // 54 * stackSize
  doubleChestsRequired: number; // minimum physical double chests needed
  shulkerStorageText: string; // e.g. "1 Shulker required", "2 Shulkers required"
  doubleChestStorageText: string; // e.g. "1 Double Chest required", "2 Double Chests required"
}

/**
 * Format stacks in clean, natural Minecraft language.
 * Examples (stackSize 64):
 * - 0 -> "0 items"
 * - 1 -> "1 item"
 * - 32 -> "32 items"
 * - 64 -> "1 stack"
 * - 65 -> "1 stack + 1"
 * - 128 -> "2 stacks"
 * - 129 -> "2 stacks + 1"
 * - 1248 -> "19 stacks + 32"
 * - 1728 -> "27 stacks"
 * - 1729 -> "27 stacks + 1"
 * - 3456 -> "54 stacks"
 */
export function formatStacks(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  if (safeAmount === 0) {
    return '0 items';
  }

  // If stack size is 1 (e.g. tools, shulker boxes)
  if (safeStackSize === 1) {
    return safeAmount === 1 ? '1 item (1 stack)' : `${safeAmount} items (${safeAmount} stacks)`;
  }

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;

  if (fullStacks === 0) {
    return remainder === 1 ? '1 item' : `${remainder} items`;
  }

  const stackWord = fullStacks === 1 ? 'stack' : 'stacks';

  if (remainder === 0) {
    return `${fullStacks} ${stackWord}`;
  }

  return `${fullStacks} ${stackWord} + ${remainder}`;
}

/**
 * Compact format for tables: e.g. "19 + 32", "1", "1 + 1", "32"
 */
export function formatStacksCompact(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  if (safeAmount === 0) return '0';
  if (safeStackSize === 1) return `${safeAmount}`;

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;

  if (fullStacks === 0) return `${remainder}`;
  if (remainder === 0) return `${fullStacks}`;
  return `${fullStacks} + ${remainder}`;
}

/**
 * Calculates containers needed (minimum physical boxes/chests to hold the items).
 */
export function calculateRequiredContainers(amount: number, stackSize = 64): {
  shulkersRequired: number;
  doubleChestsRequired: number;
} {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  if (safeAmount === 0) {
    return { shulkersRequired: 0, doubleChestsRequired: 0 };
  }

  const shulkerCapacity = 27 * safeStackSize;
  const doubleChestCapacity = 54 * safeStackSize;

  return {
    shulkersRequired: Math.ceil(safeAmount / shulkerCapacity),
    doubleChestsRequired: Math.ceil(safeAmount / doubleChestCapacity),
  };
}

/**
 * Comprehensive calculation function for any item amount and stack size.
 */
export function calculateItemQuantity(amount: number, stackSize = 64): ItemQuantityBreakdown {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;
  const stacksRequired = safeAmount === 0 ? 0 : Math.ceil(safeAmount / safeStackSize);

  const shulkerCapacity = 27 * safeStackSize;
  const doubleChestCapacity = 54 * safeStackSize;

  const shulkersRequired = safeAmount === 0 ? 0 : Math.ceil(safeAmount / shulkerCapacity);
  const doubleChestsRequired = safeAmount === 0 ? 0 : Math.ceil(safeAmount / doubleChestCapacity);

  const stacksFormatted = formatStacks(safeAmount, safeStackSize);
  const stacksCompact = formatStacksCompact(safeAmount, safeStackSize);

  const shulkerStorageText = shulkersRequired === 1
    ? '1 Shulker required'
    : `${shulkersRequired} Shulkers required`;

  const doubleChestStorageText = doubleChestsRequired === 1
    ? '1 Double Chest required'
    : `${doubleChestsRequired} Double Chests required`;

  return {
    items: safeAmount,
    stackSize: safeStackSize,
    fullStacks,
    remainder,
    stacksRequired,
    stacksFormatted,
    stacksCompact,
    shulkerCapacity,
    shulkersRequired,
    doubleChestCapacity,
    doubleChestsRequired,
    shulkerStorageText,
    doubleChestStorageText,
  };
}

// Backwards compatibility helpers
export function calculateStacks(amount: number, stackSize = 64) {
  const q = calculateItemQuantity(amount, stackSize);
  return {
    total: q.items,
    stackSize: q.stackSize,
    fullStacks: q.fullStacks,
    remainder: q.remainder,
    formatted: q.stacksFormatted,
    compact: q.stacksCompact,
  };
}

export function calculateStorage(amount: number, stackSize = 64) {
  const q = calculateItemQuantity(amount, stackSize);
  return {
    items: q.items,
    stackSize: q.stackSize,
    fullStacks: q.fullStacks,
    remainder: q.remainder,
    shulkersRequired: q.shulkersRequired,
    doubleChestsRequired: q.doubleChestsRequired,
    shulkerStorageFormatted: q.shulkerStorageText,
    doubleChestStorageFormatted: q.doubleChestStorageText,
  };
}

export function calculateShulkerStorage(amount: number, stackSize = 64): string {
  const q = calculateItemQuantity(amount, stackSize);
  return q.shulkerStorageText;
}

export function calculateDoubleChestStorage(amount: number, stackSize = 64): string {
  const q = calculateItemQuantity(amount, stackSize);
  return q.doubleChestStorageText;
}
