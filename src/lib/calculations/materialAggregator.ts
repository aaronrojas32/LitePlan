import { ParsedMaterialRow, AnalyzedMaterial, UnrecognizedMaterial } from '../../types/material';
import { BuildSummary } from '../../types/parser';
import { normalizeMaterial } from '../parser/materialNormalizer';
import {
  calculateItemQuantity,
  calculateRequiredContainers,
  calculateShulkerStorage,
  calculateDoubleChestStorage,
} from '../minecraft/storageCalculator';
import { isCraftable, getRecipeForItem } from '../recipes/recipeDatabase';

export function aggregateMaterials(
  rows: ParsedMaterialRow[],
  existingOwnedMap: Record<string, number> = {}
): {
  materials: AnalyzedMaterial[];
  unrecognized: UnrecognizedMaterial[];
  summary: BuildSummary;
} {
  const aggregatedMap = new Map<string, {
    materialDef: ReturnType<typeof normalizeMaterial>['material'];
    total: number;
    missing: number;
    available: number;
    rawNames: Set<string>;
    isRecognized: boolean;
  }>();

  const unrecognizedList: UnrecognizedMaterial[] = [];

  for (const row of rows) {
    if (!row.rawName || !row.rawName.trim()) continue;

    const { material, isRecognized } = normalizeMaterial(row.rawName);

    if (!isRecognized) {
      unrecognizedList.push({
        rawName: row.rawName,
        total: row.total,
        missing: row.missing,
        available: row.available,
        reason: 'Unrecognized Minecraft block or item name',
      });
    }

    const key = material.id;
    const existing = aggregatedMap.get(key);

    if (existing) {
      existing.total += row.total;
      existing.missing += row.missing;
      existing.available += row.available;
      existing.rawNames.add(row.rawName);
    } else {
      aggregatedMap.set(key, {
        materialDef: material,
        total: row.total,
        missing: row.missing,
        available: row.available,
        rawNames: new Set([row.rawName]),
        isRecognized,
      });
    }
  }

  const materials: AnalyzedMaterial[] = [];
  let totalBlocks = 0;
  let totalOwned = 0;
  let totalMissing = 0;
  let totalAvailable = 0;
  let craftableCount = 0;
  let totalSlotsSum = 0;
  let totalCraftingOps = 0;
  const uniqueRecipesUsed = new Set<string>();

  for (const item of aggregatedMap.values()) {
    const mat = item.materialDef;
    const craftable = isCraftable(mat.id);
    const stackSize = mat.stackSize || 64;

    // The base source of truth is always integer items/blocks
    const owned = existingOwnedMap[mat.id] !== undefined
      ? Math.max(0, existingOwnedMap[mat.id])
      : Math.max(0, item.available);

    const missing = Math.max(0, item.total - owned);

    // Calculate complete representations from the base amount
    const reqQ = calculateItemQuantity(item.total, stackSize);
    const missQ = calculateItemQuantity(missing, stackSize);

    totalBlocks += item.total;
    totalOwned += owned;
    totalMissing += missing;
    totalAvailable += item.available;
    if (craftable) craftableCount += item.total;

    totalSlotsSum += reqQ.stacksRequired;

    if (craftable) {
      const recipe = getRecipeForItem(mat.id);
      if (recipe) {
        uniqueRecipesUsed.add(recipe.id);
        const craftsNeeded = Math.ceil(item.total / recipe.output.quantity);
        totalCraftingOps += craftsNeeded;
      }
    }

    materials.push({
      id: mat.id,
      minecraftId: mat.minecraftId,
      displayName: mat.displayNameEs || mat.displayNameEn,
      displayNameEn: mat.displayNameEn,
      displayNameEs: mat.displayNameEs,
      category: mat.category,
      stackSize,
      totalRequired: item.total,
      owned,
      missing,
      available: item.available,
      quantity: reqQ,
      quantityMissing: missQ,
      stacksRequired: {
        total: reqQ.items,
        stackSize: reqQ.stackSize,
        fullStacks: reqQ.fullStacks,
        remainder: reqQ.remainder,
        formatted: reqQ.stacksFormatted,
        compact: reqQ.stacksCompact,
      },
      stacksMissing: {
        total: missQ.items,
        stackSize: missQ.stackSize,
        fullStacks: missQ.fullStacks,
        remainder: missQ.remainder,
        formatted: missQ.stacksFormatted,
        compact: missQ.stacksCompact,
      },
      storage: {
        items: reqQ.items,
        stackSize: reqQ.stackSize,
        fullStacks: reqQ.fullStacks,
        remainder: reqQ.remainder,
        shulkersRequired: reqQ.shulkersRequired,
        doubleChestsRequired: reqQ.doubleChestsRequired,
        shulkerStorageFormatted: reqQ.shulkerStorageText,
        doubleChestStorageFormatted: reqQ.doubleChestStorageText,
      },
      craftable,
      isRaw: !craftable,
      source: mat.source,
      unrecognized: !item.isRecognized,
    });
  }

  // Sort by missing descending by default, then totalRequired descending
  materials.sort((a, b) => {
    if (b.missing !== a.missing) {
      return b.missing - a.missing;
    }
    return b.totalRequired - a.totalRequired;
  });

  const containers = calculateRequiredContainers(totalBlocks, 64);
  const shulkerStorageFormatted = calculateShulkerStorage(totalBlocks, 64);
  const doubleChestStorageFormatted = calculateDoubleChestStorage(totalBlocks, 64);

  const summary: BuildSummary = {
    totalUniqueMaterials: materials.length,
    totalBlocks,
    totalMissing,
    totalOwned,
    totalAvailable,
    craftableCount,
    rawMaterialCount: materials.filter(m => !m.craftable).length,
    totalStacks: totalSlotsSum,
    totalCraftingOperations: totalCraftingOps,
    uniqueRecipesCount: uniqueRecipesUsed.size,
    equivalentStorageFormatted: shulkerStorageFormatted,
    shulkerStorageFormatted,
    doubleChestStorageFormatted,
    shulkersRequired: containers.shulkersRequired,
    doubleChestsRequired: containers.doubleChestsRequired,
  };

  return {
    materials,
    unrecognized: unrecognizedList,
    summary,
  };
}
