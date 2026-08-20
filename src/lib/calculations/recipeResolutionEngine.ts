import { Recipe, RecipeType, MaterialTier, ResolvedRecipeNode } from '../../data/minecraft/recipes/types';
import { getRecipeForItem, RecipeSelectionOptions } from '../../data/minecraft/recipes';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { calculateStacks } from '../minecraft/storageCalculator';

export interface ResolutionPathStep {
  itemId: string;
  displayName: string;
  tier: MaterialTier;
  recipeType?: RecipeType;
  quantity: number;
}

export interface TreeResolutionResult {
  root: ResolvedRecipeNode;
  leafRawMaterials: Map<string, {
    quantity: number;
    usedIn: Map<string, { targetName: string; quantityRequired: number }>;
  }>;
  intermediateOperations: Map<string, {
    outputItemId: string;
    outputName: string;
    totalUnitsNeeded: number;
    craftsNeeded: number;
    producedQuantity: number;
    extraQuantity: number;
    recipe: Recipe;
    tier: MaterialTier;
    ingredients: Array<{
      itemId: string;
      displayName: string;
      quantity: number;
      stacks: string;
    }>;
  }>;
}

/**
 * Resolves a full hierarchical recipe tree for any target item and quantity.
 * Incorporates cycle prevention, memoization, integer craft ceil math, surplus tracking,
 * and 4-tier categorization (BUILD -> INTERMEDIATE / PROCESSING -> RAW).
 */
export function resolveRecipeTree(
  itemId: string,
  quantity: number,
  options: RecipeSelectionOptions = { allowSmelting: true },
  visited = new Set<string>(),
  isRoot = true
): ResolvedRecipeNode {
  const matDef = MATERIALS_DATABASE[itemId];
  const displayName = matDef?.displayNameEs || matDef?.displayNameEn || itemId.replace('minecraft:', '');

  const stackSize = matDef?.stackSize || 64;
  const stacks = calculateStacks(quantity, stackSize).formatted;

  if (quantity <= 0) {
    return {
      itemId,
      displayName,
      tier: 'RAW',
      quantity: 0,
      totalQuantity: 0,
      stacks: calculateStacks(0, stackSize).formatted,
      isLeaf: true,
      children: [],
    };
  }

  const recipe = getRecipeForItem(itemId, options);

  // If no applicable recipe exists, circular loop, or base raw world material reached, it's a RAW terminal leaf
  const isBaseRawWorldMaterial = Boolean(matDef?.isRaw && !isRoot && !options.allowSyntheticCrafting);
  if (!recipe || visited.has(itemId) || isBaseRawWorldMaterial) {
    return {
      itemId,
      displayName,
      tier: isRoot ? 'BUILD' : 'RAW',
      quantity,
      totalQuantity: quantity,
      stacks,
      isLeaf: true,
      transformationText: isBaseRawWorldMaterial
        ? 'Base Harvest Resource'
        : !recipe
        ? 'Base Raw Resource (No recipe)'
        : 'Circular Reference Protected',
      children: [],
    };
  }

  const currentVisited = new Set(visited).add(itemId);
  const craftCount = Math.ceil(quantity / recipe.output.quantity);
  const producedQuantity = craftCount * recipe.output.quantity;
  const extraQuantity = Math.max(0, producedQuantity - quantity);

  // Determine material tier
  let tier: MaterialTier = 'INTERMEDIATE';
  if (isRoot) {
    tier = 'BUILD';
  } else if (
    recipe.type === 'smelting' ||
    recipe.type === 'blasting' ||
    recipe.type === 'smoking' ||
    recipe.type === 'stonecutting' ||
    recipe.type === 'campfire_cooking'
  ) {
    tier = 'PROCESSING';
  }

  const transformationText = recipe.type === 'smelting'
    ? `Smelting in furnace (${craftCount}x)`
    : recipe.type === 'stonecutting'
    ? `Stonecutter (${craftCount}x)`
    : `Crafting (${craftCount}x)`;

  // Recursively resolve ingredients
  const children: ResolvedRecipeNode[] = recipe.ingredients.map((ing) => {
    const requiredForIngredient = craftCount * ing.quantity;
    return resolveRecipeTree(
      ing.itemId,
      requiredForIngredient,
      options,
      currentVisited,
      false
    );
  });

  return {
    itemId,
    displayName,
    tier,
    quantity,
    totalQuantity: quantity,
    stacks,
    isLeaf: false,
    recipeType: recipe.type,
    recipe,
    craftCount,
    producedQuantity,
    extraQuantity,
    transformationText,
    children,
  };
}

/**
 * Extracts all leaf raw materials and operations from a collection of resolved tree nodes
 */
export function processBuildTree(
  buildItems: Array<{ itemId: string; displayName: string; quantity: number }>,
  options: RecipeSelectionOptions = { allowSmelting: true }
): TreeResolutionResult {
  const leafRawMap = new Map<string, {
    quantity: number;
    usedIn: Map<string, { targetName: string; quantityRequired: number }>;
  }>();

  const operationsMap = new Map<string, {
    outputItemId: string;
    outputName: string;
    totalUnitsNeeded: number;
    craftsNeeded: number;
    producedQuantity: number;
    extraQuantity: number;
    recipe: Recipe;
    tier: MaterialTier;
    ingredients: Array<{
      itemId: string;
      displayName: string;
      quantity: number;
      stacks: string;
    }>;
  }>();

  function traverse(node: ResolvedRecipeNode, targetItemId: string, targetName: string) {
    // If node has a recipe, record the operation
    if (node.recipe && node.craftCount && node.craftCount > 0) {
      const opKey = `${node.itemId}_${node.recipe.id}`;
      const existingOp = operationsMap.get(opKey);

      if (existingOp) {
        existingOp.totalUnitsNeeded += node.quantity;
        const newCrafts = Math.ceil(existingOp.totalUnitsNeeded / node.recipe.output.quantity);
        existingOp.craftsNeeded = newCrafts;
        existingOp.producedQuantity = newCrafts * node.recipe.output.quantity;
        existingOp.extraQuantity = Math.max(0, existingOp.producedQuantity - existingOp.totalUnitsNeeded);

        // Recalculate ingredient totals
        existingOp.ingredients = node.recipe.ingredients.map((ing) => {
          const ingDef = MATERIALS_DATABASE[ing.itemId];
          const ingStackSize = ingDef?.stackSize || 64;
          const totalIngUnits = newCrafts * ing.quantity;
          return {
            itemId: ing.itemId,
            displayName: ingDef?.displayNameEs || ingDef?.displayNameEn || ing.itemId.replace('minecraft:', ''),
            quantity: totalIngUnits,
            stacks: calculateStacks(totalIngUnits, ingStackSize).formatted,
          };
        });
      } else {
        const ingredients = node.recipe.ingredients.map((ing) => {
          const ingDef = MATERIALS_DATABASE[ing.itemId];
          const ingStackSize = ingDef?.stackSize || 64;
          const totalIngUnits = node.craftCount! * ing.quantity;
          return {
            itemId: ing.itemId,
            displayName: ingDef?.displayNameEs || ingDef?.displayNameEn || ing.itemId.replace('minecraft:', ''),
            quantity: totalIngUnits,
            stacks: calculateStacks(totalIngUnits, ingStackSize).formatted,
          };
        });

        operationsMap.set(opKey, {
          outputItemId: node.itemId,
          outputName: node.displayName,
          totalUnitsNeeded: node.quantity,
          craftsNeeded: node.craftCount,
          producedQuantity: node.producedQuantity || node.quantity,
          extraQuantity: node.extraQuantity || 0,
          recipe: node.recipe,
          tier: node.tier,
          ingredients,
        });
      }
    }

    // If node is a terminal leaf (no children and no recipe), accumulate as RAW
    if (node.children.length === 0 && !node.recipe) {
      const existingRaw = leafRawMap.get(node.itemId);
      if (existingRaw) {
        existingRaw.quantity += node.quantity;
        const targetExisting = existingRaw.usedIn.get(targetItemId);
        if (targetExisting) {
          targetExisting.quantityRequired += node.quantity;
        } else {
          existingRaw.usedIn.set(targetItemId, { targetName, quantityRequired: node.quantity });
        }
      } else {
        const usedInMap = new Map<string, { targetName: string; quantityRequired: number }>();
        usedInMap.set(targetItemId, { targetName, quantityRequired: node.quantity });
        leafRawMap.set(node.itemId, {
          quantity: node.quantity,
          usedIn: usedInMap,
        });
      }
      return;
    }

    // Traverse children
    for (const child of node.children) {
      traverse(child, targetItemId, targetName);
    }
  }

  // Process all build items
  const virtualRoots: ResolvedRecipeNode[] = [];
  for (const item of buildItems) {
    const rootNode = resolveRecipeTree(item.itemId, item.quantity, options);
    virtualRoots.push(rootNode);
    traverse(rootNode, item.itemId, item.displayName);
  }

  const totalBuildQty = buildItems.reduce((acc, i) => acc + i.quantity, 0);
  const combinedRoot: ResolvedRecipeNode = {
    itemId: 'liteplan:build_root',
    displayName: 'Complete Build Requirements',
    tier: 'BUILD',
    quantity: totalBuildQty,
    totalQuantity: totalBuildQty,
    stacks: calculateStacks(totalBuildQty, 64).formatted,
    isLeaf: false,
    children: virtualRoots,
  };

  return {
    root: combinedRoot,
    leafRawMaterials: leafRawMap,
    intermediateOperations: operationsMap,
  };
}

/**
 * Gets a clean linear resolution path for an item (e.g. Build -> Crafting -> Smelting -> Raw)
 */
export function getResolutionPath(itemId: string, quantity: number = 1): ResolutionPathStep[] {
  const steps: ResolutionPathStep[] = [];
  let currentItemId: string | null = itemId;
  let currentQty = quantity;
  const visited = new Set<string>();

  while (currentItemId && !visited.has(currentItemId)) {
    visited.add(currentItemId);
    const matDef = MATERIALS_DATABASE[currentItemId];
    const displayName = matDef?.displayNameEs || matDef?.displayNameEn || currentItemId.replace('minecraft:', '');
    const recipe = getRecipeForItem(currentItemId);

    if (!recipe) {
      steps.push({
        itemId: currentItemId,
        displayName,
        tier: steps.length === 0 ? 'BUILD' : 'RAW',
        quantity: currentQty,
      });
      break;
    }

    const tier: MaterialTier = steps.length === 0
      ? 'BUILD'
      : recipe.type === 'smelting'
      ? 'PROCESSING'
      : 'INTERMEDIATE';

    steps.push({
      itemId: currentItemId,
      displayName,
      tier,
      recipeType: recipe.type,
      quantity: currentQty,
    });

    // Advance to primary ingredient for the linear trace
    const primaryIngredient = recipe.ingredients[0];
    if (primaryIngredient) {
      const craftCount = Math.ceil(currentQty / recipe.output.quantity);
      currentQty = craftCount * primaryIngredient.quantity;
      currentItemId = primaryIngredient.itemId;
    } else {
      break;
    }
  }

  return steps;
}
