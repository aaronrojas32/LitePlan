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

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
}

export interface RecipeGrid {
  size: '2x2' | '3x3';
  pattern: (string | null)[][];
}

export interface Recipe {
  id: string;
  type: RecipeType;
  output: {
    itemId: string;
    quantity: number;
  };
  ingredients: RecipeIngredient[];
  grid?: RecipeGrid;
  gridSize?: '2x2' | '3x3';
  gridPattern?: (string | null)[][];
  smeltingInput?: string;
  cookingTime?: number;
  experience?: number;
  priority?: number; // Higher number = preferred primary recipe (e.g. 100 for standard craft, 80 for stonecutter)
  isDefault?: boolean;
  source?: string;
  minecraftVersion?: '1.21' | string;
  description?: string;
}

export type MaterialTier = 'BUILD' | 'INTERMEDIATE' | 'PROCESSING' | 'RAW';

export interface ResolvedRecipeNode {
  itemId: string;
  displayName: string;
  tier: MaterialTier;
  quantity: number;
  recipeType?: RecipeType;
  recipe?: Recipe;
  craftCount?: number;
  producedQuantity?: number;
  extraQuantity?: number;
  transformationText?: string;
  children: ResolvedRecipeNode[];
}
