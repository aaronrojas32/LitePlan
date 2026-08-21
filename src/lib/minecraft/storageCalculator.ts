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

export interface ContainerBreakdown {
  items: number;
  stackSize: number;

  // Stacks breakdown
  fullStacks: number;
  remainderItems: number;
  stacksFormatted: string; // e.g. "75 stacks", "75 stacks + 32", "32 items"
  stacksCompact: string;   // e.g. "75 + 32", "1", "32"
  stacksWithUnit: string;  // e.g. "75s", "75s 32", "32"

  // Shulker Boxes (27 stacks capacity)
  shulkerCapacity: number; // 27 * stackSize (1,728 for 64, 432 for 16, 27 for 1)
  fullShulkers: number;
  remainderShulkerStacks: number;
  remainderShulkerItems: number;
  shulkersRequired: number; // Math.ceil(items / shulkerCapacity)
  shulkerCompact: string;   // e.g. "2 SB + 21s", "1 SB", "0 SB + 12s"
  shulkerDetailed: string;  // e.g. "2 Shulkers + 21 stacks"

  // Double Chests (54 stacks capacity)
  doubleChestCapacity: number; // 54 * stackSize (3,456 for 64, 864 for 16, 54 for 1)
  fullDoubleChests: number;
  remainderDoubleChestShulkers: number;
  remainderDoubleChestStacks: number;
  doubleChestsRequired: number; // Math.ceil(items / doubleChestCapacity)
  doubleChestCompact: string;  // e.g. "1 DC + 21s", "2 DC"
  doubleChestDetailed: string; // e.g. "1 Double Chest + 21 stacks"
}

export interface ItemQuantityBreakdown extends ContainerBreakdown {
  remainder: number; // Backwards compatibility for remainderItems
  stacksRequired: number; // Slots required in inventory/chest
  shulkerStorageText: string; // e.g. "1 Shulker required", "2 Shulkers required"
  doubleChestStorageText: string; // e.g. "1 Double Chest required", "2 Double Chests required"
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
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

  if (safeStackSize === 1) {
    return safeAmount === 1 ? '1 item' : `${fmt(safeAmount)} items`;
  }

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;

  if (fullStacks === 0) {
    return remainder === 1 ? '1 item' : `${remainder} items`;
  }

  const stackWord = fullStacks === 1 ? 'stack' : 'stacks';

  if (remainder === 0) {
    return `${fmt(fullStacks)} ${stackWord}`;
  }

  return `${fmt(fullStacks)} ${stackWord} + ${remainder}`;
}

/**
 * Compact format for stacks: e.g. "19 + 32", "1", "1 + 1", "32"
 */
export function formatStacksCompact(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  if (safeAmount === 0) return '0';
  if (safeStackSize === 1) return `${fmt(safeAmount)}`;

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;

  if (fullStacks === 0) return `${remainder}`;
  if (remainder === 0) return `${fmt(fullStacks)}`;
  return `${fmt(fullStacks)} + ${remainder}`;
}

/**
 * Format stacks with unit: e.g. "19s 32", "1s", "32"
 */
export function formatStacksWithUnit(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  if (safeAmount === 0) return '0';
  if (safeStackSize === 1) return `${fmt(safeAmount)}`;

  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainder = safeAmount % safeStackSize;

  if (fullStacks === 0) return `${remainder}`;
  if (remainder === 0) return `${fmt(fullStacks)}s`;
  return `${fmt(fullStacks)}s ${remainder}`;
}

/**
 * Format Shulker boxes breakdown compact: e.g. "2 SB + 21s", "1 SB", "0 SB + 12s"
 */
export function formatShulkersCompact(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);
  const shulkerCap = 27 * safeStackSize;

  if (safeAmount === 0) return '0 SB';

  const fullSB = Math.floor(safeAmount / shulkerCap);
  const remainderItems = safeAmount % shulkerCap;
  const remStacks = Math.floor(remainderItems / safeStackSize);
  const remItems = remainderItems % safeStackSize;

  if (fullSB === 0) {
    if (remStacks === 0) return `${remItems} items`;
    return remItems > 0 ? `${remStacks}s ${remItems}` : `${remStacks}s`;
  }

  if (remainderItems === 0) {
    return `${fmt(fullSB)} SB`;
  }

  if (remStacks > 0 && remItems > 0) {
    return `${fmt(fullSB)} SB + ${remStacks}s ${remItems}`;
  }
  if (remStacks > 0) {
    return `${fmt(fullSB)} SB + ${remStacks}s`;
  }
  return `${fmt(fullSB)} SB + ${remItems}`;
}

/**
 * Format Double Chests breakdown compact: e.g. "1 DC + 21s", "2 DC"
 */
export function formatDoubleChestsCompact(amount: number, stackSize = 64): string {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);
  const dcCap = 54 * safeStackSize;
  const sbCap = 27 * safeStackSize;

  if (safeAmount === 0) return '0 DC';

  const fullDC = Math.floor(safeAmount / dcCap);
  const remainderItems = safeAmount % dcCap;
  const remSB = Math.floor(remainderItems / sbCap);
  const remStacks = Math.floor((remainderItems % sbCap) / safeStackSize);
  const remItems = (remainderItems % sbCap) % safeStackSize;

  if (fullDC === 0) {
    return formatShulkersCompact(safeAmount, safeStackSize);
  }

  if (remainderItems === 0) {
    return `${fmt(fullDC)} DC`;
  }

  if (remSB > 0) {
    return remStacks > 0
      ? `${fmt(fullDC)} DC + ${remSB} SB + ${remStacks}s`
      : `${fmt(fullDC)} DC + ${remSB} SB`;
  }

  if (remStacks > 0) {
    return remItems > 0
      ? `${fmt(fullDC)} DC + ${remStacks}s ${remItems}`
      : `${fmt(fullDC)} DC + ${remStacks}s`;
  }

  return `${fmt(fullDC)} DC + ${remItems}`;
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
 * Comprehensive container calculation function for any item amount and stack size.
 */
export function calculateContainerBreakdown(amount: number, stackSize = 64): ContainerBreakdown {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const safeStackSize = Math.max(1, stackSize || 64);

  // Stacks calculations
  const fullStacks = Math.floor(safeAmount / safeStackSize);
  const remainderItems = safeAmount % safeStackSize;
  const stacksFormatted = formatStacks(safeAmount, safeStackSize);
  const stacksCompact = formatStacksCompact(safeAmount, safeStackSize);
  const stacksWithUnit = formatStacksWithUnit(safeAmount, safeStackSize);

  // Shulker calculations
  const shulkerCapacity = 27 * safeStackSize;
  const fullShulkers = Math.floor(safeAmount / shulkerCapacity);
  const shulkerRemainder = safeAmount % shulkerCapacity;
  const remainderShulkerStacks = Math.floor(shulkerRemainder / safeStackSize);
  const remainderShulkerItems = shulkerRemainder % safeStackSize;
  const shulkersRequired = safeAmount === 0 ? 0 : Math.ceil(safeAmount / shulkerCapacity);
  const shulkerCompact = formatShulkersCompact(safeAmount, safeStackSize);
  const shulkerDetailed = fullShulkers === 0
    ? stacksFormatted
    : remainderShulkerStacks > 0
    ? `${fmt(fullShulkers)} ${fullShulkers === 1 ? 'Shulker' : 'Shulkers'} + ${remainderShulkerStacks} ${remainderShulkerStacks === 1 ? 'stack' : 'stacks'}`
    : `${fmt(fullShulkers)} ${fullShulkers === 1 ? 'Shulker' : 'Shulkers'}`;

  // Double Chest calculations
  const doubleChestCapacity = 54 * safeStackSize;
  const fullDoubleChests = Math.floor(safeAmount / doubleChestCapacity);
  const doubleChestRemainder = safeAmount % doubleChestCapacity;
  const remainderDoubleChestShulkers = Math.floor(doubleChestRemainder / shulkerCapacity);
  const remainderDoubleChestStacks = Math.floor((doubleChestRemainder % shulkerCapacity) / safeStackSize);
  const doubleChestsRequired = safeAmount === 0 ? 0 : Math.ceil(safeAmount / doubleChestCapacity);
  const doubleChestCompact = formatDoubleChestsCompact(safeAmount, safeStackSize);
  const doubleChestDetailed = fullDoubleChests === 0
    ? shulkerDetailed
    : remainderDoubleChestStacks > 0
    ? `${fmt(fullDoubleChests)} ${fullDoubleChests === 1 ? 'Double Chest' : 'Double Chests'} + ${remainderDoubleChestStacks} stacks`
    : `${fmt(fullDoubleChests)} ${fullDoubleChests === 1 ? 'Double Chest' : 'Double Chests'}`;

  return {
    items: safeAmount,
    stackSize: safeStackSize,
    fullStacks,
    remainderItems,
    stacksFormatted,
    stacksCompact,
    stacksWithUnit,
    shulkerCapacity,
    fullShulkers,
    remainderShulkerStacks,
    remainderShulkerItems,
    shulkersRequired,
    shulkerCompact,
    shulkerDetailed,
    doubleChestCapacity,
    fullDoubleChests,
    remainderDoubleChestShulkers,
    remainderDoubleChestStacks,
    doubleChestsRequired,
    doubleChestCompact,
    doubleChestDetailed,
  };
}

/**
 * Comprehensive calculation function for any item amount and stack size (Full Breakdown).
 */
export function calculateItemQuantity(amount: number, stackSize = 64): ItemQuantityBreakdown {
  const breakdown = calculateContainerBreakdown(amount, stackSize);
  const stacksRequired = breakdown.items === 0 ? 0 : Math.ceil(breakdown.items / breakdown.stackSize);

  const shulkerStorageText = breakdown.shulkersRequired === 1
    ? '1 Shulker required'
    : `${breakdown.shulkersRequired.toLocaleString()} Shulkers required`;

  const doubleChestStorageText = breakdown.doubleChestsRequired === 1
    ? '1 Double Chest required'
    : `${breakdown.doubleChestsRequired.toLocaleString()} Double Chests required`;

  return {
    ...breakdown,
    remainder: breakdown.remainderItems,
    stacksRequired,
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
    remainder: q.remainderItems,
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
    remainder: q.remainderItems,
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
