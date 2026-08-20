import React, { useState, useEffect } from 'react';
import { Recipe } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { calculateCraftDetails } from '../lib/calculations/recipeCalculator';
import { getAllRecipesForItem } from '../lib/recipes/recipeDatabase';
import { ArrowRight, Sparkles, Flame, Hammer, Scissors } from 'lucide-react';
import { resolveItemDefinition } from '../lib/minecraft/itemResolver';

interface RecipeViewerProps {
  recipe: Recipe;
  requiredQuantity?: number;
  availableRecipes?: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
}

export const RecipeViewer: React.FC<RecipeViewerProps> = ({
  recipe,
  requiredQuantity = recipe.output.quantity,
  availableRecipes,
  onSelectRecipe,
}) => {
  // Get all alternative recipes for this output item
  const allAlternatives = availableRecipes || getAllRecipesForItem(recipe.output.itemId);
  const recipesList = allAlternatives.length > 0 ? allAlternatives : [recipe];

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipe.id);

  useEffect(() => {
    setSelectedRecipeId(recipe.id);
  }, [recipe.id]);

  const currentRecipe = recipesList.find((r) => r.id === selectedRecipeId) || recipe;

  const outputDef = resolveItemDefinition(currentRecipe.output.itemId);
  const outputName =
    outputDef?.displayNameEs ||
    outputDef?.displayNameEn ||
    currentRecipe.output.itemId.replace('minecraft:', '');

  const craftDetails = calculateCraftDetails(currentRecipe, requiredQuantity);
  const isSmelting =
    currentRecipe.type === 'smelting' ||
    currentRecipe.type === 'blasting' ||
    currentRecipe.type === 'smoking';
  const isStonecutting = currentRecipe.type === 'stonecutting';

  const handleSelect = (r: Recipe) => {
    setSelectedRecipeId(r.id);
    if (onSelectRecipe) {
      onSelectRecipe(r);
    }
  };

  const getRecipeTypeLabel = (r: Recipe) => {
    if (r.type === 'stonecutting') return { label: 'Cortapiedras', icon: '🪚', efficiency: '⭐ Más eficiente' };
    if (r.type === 'smelting') return { label: 'Horno', icon: '🔥', efficiency: '' };
    if (r.type === 'blasting') return { label: 'Alto horno', icon: '💨', efficiency: '2x Rápido' };
    if (r.type === 'smoking') return { label: 'Ahumador', icon: '🍖', efficiency: '2x Rápido' };
    if (r.type === 'crafting_shaped') return { label: `Mesa (${r.gridSize || '3x3'})`, icon: '🛠️', efficiency: '' };
    if (r.id.includes('from_cobblestone_and_quartz') || r.id.includes('from_diorite')) {
      return { label: 'Síntesis (Cuarzo)', icon: '⚗️', efficiency: 'Crafteo manual' };
    }
    return { label: 'Mesa de crafteo', icon: '🛠️', efficiency: '' };
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5 text-xs">
      {/* Alternative Recipes Switcher Header */}
      {recipesList.length > 1 && (
        <div className="space-y-1.5 pb-1 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Métodos disponibles ({recipesList.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recipesList.map((r) => {
              const isSelected = r.id === currentRecipe.id;
              const typeInfo = getRecipeTypeLabel(r);

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{typeInfo.icon}</span>
                  <span>{typeInfo.label}</span>
                  {typeInfo.efficiency && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isSelected
                          ? 'bg-blue-700/80 text-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {typeInfo.efficiency}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          {isStonecutting && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <Scissors className="w-3.5 h-3.5" /> Cortapiedras (Stonecutter)
            </span>
          )}
          {isSmelting && (
            <span className="inline-flex items-center gap-1 text-orange-700 font-bold">
              <Flame className="w-3.5 h-3.5" /> Fundición en Horno
            </span>
          )}
          {!isStonecutting && !isSmelting && (
            <span className="inline-flex items-center gap-1 text-slate-800">
              <Hammer className="w-3.5 h-3.5" /> Cuadrícula de Crafteo ({currentRecipe.gridSize || '3x3'})
            </span>
          )}
        </div>
        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
          {craftDetails.craftsRequired} {craftDetails.craftsRequired === 1 ? 'crafteo' : 'crafteos'}
        </span>
      </div>

      {/* Visual Workspace (Stonecutter vs Smelting vs Grid vs Shapeless) */}
      <div className="flex items-center justify-center gap-4 py-1">
        {/* Input */}
        <div>
          {isStonecutting ? (
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5 shadow-2xs">
              <ItemIcon itemId={currentRecipe.ingredients[0].itemId} size={30} />
              <div>
                <span className="font-semibold text-slate-900 block">
                  {craftDetails.ingredientsNeeded[0]?.displayName}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  1 bloque por uso
                </span>
              </div>
            </div>
          ) : isSmelting ? (
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs">
              <ItemIcon itemId={currentRecipe.ingredients[0].itemId} size={28} />
              <div>
                <span className="font-semibold text-slate-900 block">
                  {craftDetails.ingredientsNeeded[0]?.displayName}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {craftDetails.ingredientsNeeded[0]?.quantity} unidades
                </span>
              </div>
            </div>
          ) : currentRecipe.gridPattern ? (
            <div
              className={`grid gap-1 p-1.5 bg-slate-200 rounded-lg border border-slate-300 shadow-inner ${
                currentRecipe.gridSize === '2x2' || currentRecipe.gridPattern.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {currentRecipe.gridPattern.flatMap((row, rIdx) =>
                row.map((cellId, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-9 h-9 rounded border flex items-center justify-center p-0.5 ${
                      cellId
                        ? 'bg-white border-slate-300 shadow-2xs'
                        : 'bg-slate-100/50 border-dashed border-slate-300/60'
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
                  className="flex items-center justify-between gap-3 px-2 py-1 bg-white rounded border border-slate-200 shadow-2xs"
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

        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

        {/* Output */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <ItemIcon itemId={currentRecipe.output.itemId} size={32} />
          <div>
            <div className="font-bold text-slate-900">{outputName}</div>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold">
              {craftDetails.producedQuantity.toLocaleString()} producidos
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ({currentRecipe.output.quantity}x por crafteo)
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency note for Stonecutter */}
      {isStonecutting && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            <b>Alta Eficiencia:</b> El cortapiedras produce 1 bloque/escalera directamente sin desperdiciar materiales de la mesa de crafteo.
          </span>
        </div>
      )}

      {/* Production stats */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-center font-mono text-[11px] shadow-2xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Requeridos</span>
          <b>{craftDetails.requiredQuantity.toLocaleString()}</b>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Producidos</span>
          <b className="text-emerald-700">{craftDetails.producedQuantity.toLocaleString()}</b>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Excedente</span>
          <b className={craftDetails.extraQuantity > 0 ? 'text-amber-600' : 'text-slate-500'}>
            +{craftDetails.extraQuantity}
          </b>
        </div>
      </div>

      {/* Ingredients breakdown */}
      <div className="space-y-1 pt-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Ingredientes necesarios para {craftDetails.craftsRequired} crafteos:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {craftDetails.ingredientsNeeded.map((ing) => (
            <div
              key={ing.itemId}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <ItemIcon itemId={ing.itemId} size={18} />
                <span className="text-slate-800 font-medium">{ing.displayName}</span>
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
