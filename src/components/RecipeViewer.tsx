import React from 'react';
import { Recipe } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { calculateCraftDetails } from '../lib/calculations/recipeCalculator';
import { ArrowRight } from 'lucide-react';
import { resolveItemDefinition } from '../lib/minecraft/itemResolver';

interface RecipeViewerProps {
  recipe: Recipe;
  requiredQuantity?: number;
}

export const RecipeViewer: React.FC<RecipeViewerProps> = ({ recipe, requiredQuantity = recipe.output.quantity }) => {
  const outputDef = resolveItemDefinition(recipe.output.itemId);
  const outputName = outputDef?.displayNameEs || outputDef?.displayNameEn || recipe.output.itemId.replace('minecraft:', '');

  const craftDetails = calculateCraftDetails(recipe, requiredQuantity);
  const isSmelting = recipe.type === 'smelting' || recipe.type === 'blasting' || recipe.type === 'smoking';

  return (
    <div className="bg-slate-50 dark:bg-slate-850 rounded-lg p-4 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {isSmelting ? 'Furnace Smelting' : `Crafting Grid (${recipe.gridSize || '3x3'})`}
        </span>
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {craftDetails.craftsRequired} {craftDetails.craftsRequired === 1 ? 'craft' : 'crafts'}
        </span>
      </div>

      {/* Grid or Smelting visual */}
      <div className="flex items-center justify-center gap-4 py-1">
        {/* Input */}
        <div>
          {isSmelting ? (
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <ItemIcon itemId={recipe.ingredients[0].itemId} size={28} />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                  {craftDetails.ingredientsNeeded[0]?.displayName}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {craftDetails.ingredientsNeeded[0]?.quantity} units
                </span>
              </div>
            </div>
          ) : recipe.gridPattern ? (
            <div
              className={`grid gap-1 p-1.5 bg-slate-200 dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-750 ${
                recipe.gridSize === '2x2' || recipe.gridPattern.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {recipe.gridPattern.flatMap((row, rIdx) =>
                row.map((cellId, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-9 h-9 rounded border flex items-center justify-center p-0.5 ${
                      cellId
                        ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        : 'bg-slate-100/50 dark:bg-slate-850/50 border-dashed border-slate-300/60 dark:border-slate-800'
                    }`}
                  >
                    {cellId && <ItemIcon itemId={cellId} size={24} />}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {craftDetails.ingredientsNeeded.map((ing) => (
                <div
                  key={ing.itemId}
                  className="flex items-center justify-between gap-3 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-1.5">
                    <ItemIcon itemId={ing.itemId} size={16} />
                    <span>{ing.displayName}</span>
                  </div>
                  <span className="font-mono font-bold">{ing.quantity}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <ArrowRight className="w-4 h-4 text-slate-400" />

        {/* Output */}
        <div className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
          <ItemIcon itemId={recipe.output.itemId} size={32} />
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{outputName}</div>
            <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              {craftDetails.producedQuantity.toLocaleString()} produced
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ({recipe.output.quantity}x per craft)
            </div>
          </div>
        </div>
      </div>

      {/* Production stats */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center font-mono text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">Need</span>
          <b>{craftDetails.requiredQuantity.toLocaleString()}</b>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Produced</span>
          <b className="text-emerald-700 dark:text-emerald-400">{craftDetails.producedQuantity.toLocaleString()}</b>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Excess</span>
          <b className={craftDetails.extraQuantity > 0 ? 'text-amber-600' : 'text-slate-500'}>
            +{craftDetails.extraQuantity}
          </b>
        </div>
      </div>

      {/* Ingredients breakdown */}
      <div className="space-y-1 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Ingredients needed for {craftDetails.craftsRequired} crafts:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {craftDetails.ingredientsNeeded.map((ing) => (
            <div
              key={ing.itemId}
              className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <ItemIcon itemId={ing.itemId} size={18} />
                <span className="text-slate-800 dark:text-slate-200">{ing.displayName}</span>
              </div>
              <div className="font-mono text-right text-[11px]">
                <b>{ing.quantity.toLocaleString()}</b> <span className="text-slate-400">({ing.stacks})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
