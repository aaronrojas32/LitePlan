export type RecipeType =
  | 'crafting_shaped'
  | 'crafting_shapeless'
  | 'crafting'
  | 'smelting'
  | 'blasting'
  | 'smoking'
  | 'stonecutting'
  | 'smithing'
  | 'campfire_cooking'
  | 'brewing';

export type MaterialTier = 'BUILD' | 'INTERMEDIATE' | 'PROCESSING' | 'RAW';

export interface RecipeIngredient {
  itemId: string; // e.g. "minecraft:iron_ingot"
  quantity: number; // units needed per single recipe execution
}

export interface RecipeGrid {
  size: '2x2' | '3x3';
  pattern: (string | null)[][];
}

export interface Recipe {
  id: string;
  type: RecipeType;
  gridSize?: '2x2' | '3x3';
  gridPattern?: (string | null)[][];
  grid?: RecipeGrid;
  smeltingInput?: string; // For furnace recipes
  output: {
    itemId: string; // e.g. "minecraft:oak_planks"
    quantity: number; // e.g. 4
  };
  ingredients: RecipeIngredient[];
  priority?: number;
  isDefault?: boolean;
  source?: string;
  minecraftVersion?: '1.21' | string;
  description?: string;
  cookingTime?: number;
  experience?: number;
}

export interface CraftCalculationResult {
  craftsRequired: number; // e.g. 110
  producedQuantity: number; // e.g. 440
  requiredQuantity: number; // e.g. 437
  extraQuantity: number; // e.g. 3
  ingredientsNeeded: Array<{
    itemId: string;
    displayName: string;
    quantity: number;
    stacks: string;
  }>;
}

export interface RecipeTreeNode {
  itemId: string;
  displayName: string;
  totalQuantity: number;
  stacks: string;
  isLeaf: boolean;
  tier?: MaterialTier;
  recipeType?: RecipeType;
  transformationText?: string;
  recipe?: Recipe;
  craftCount?: number;
  producedQuantity?: number;
  extraQuantity?: number;
  children?: RecipeTreeNode[];
}

export interface RawMaterialRequirement {
  itemId: string;
  minecraftId: string;
  displayName: string;
  quantity: number; // total required
  owned: number; // amount owned in raw inventory
  missing: number; // max(0, quantity - owned)
  stacks: string;
  stacksMissing: string;
  storage: string;
  category: string;
  source: string;
  usedIn: Array<{
    targetItemId: string;
    targetName: string;
    quantityRequired: number;
  }>;
}

export interface CraftingStep {
  outputItemId: string;
  outputName: string;
  outputQuantity: number;
  ownedQuantity: number;
  missingQuantity: number;
  recipeType: RecipeType;
  craftsNeeded: number;
  producedQuantity: number;
  extraQuantity: number;
  craftableWithRaw?: number; // How many can be crafted with currently owned raw materials
  recipe?: Recipe;
  ingredients: Array<{
    itemId: string;
    displayName: string;
    quantity: number;
    stacks: string;
  }>;
}
