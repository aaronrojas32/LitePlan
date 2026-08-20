import React, { useState } from 'react';
import { CraftingStep } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { RecipeViewer } from './RecipeViewer';
import { RecipeTree } from './RecipeTree';
import { buildRecipeTree } from '../lib/recipes/recipeTree';
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Hammer,
  Flame,
  Plus,
  GitFork,
  BookOpen,
} from 'lucide-react';

interface CraftingListProps {
  craftingSteps: CraftingStep[];
  onUpdateOwned: (materialId: string, newOwned: number) => void;
}

export const CraftingList: React.FC<CraftingListProps> = ({
  craftingSteps,
  onUpdateOwned,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [stepDetailTabs, setStepDetailTabs] = useState<Record<string, 'recipe' | 'tree'>>({});
  const [isCopied, setIsCopied] = useState(false);

  const toggleExpand = (itemId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const setTab = (itemId: string, tab: 'recipe' | 'tree') => {
    setStepDetailTabs((prev) => ({
      ...prev,
      [itemId]: tab,
    }));
  };

  const handleCopy = () => {
    const text = craftingSteps
      .map(
        (s) =>
          `${s.outputName} (${s.craftsNeeded}x crafts -> ${s.outputQuantity} required, ${s.missingQuantity} missing):\n` +
          s.ingredients.map((ing) => `   - ${ing.quantity} ${ing.displayName} (${ing.stacks})`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const totalCraftOperations = craftingSteps.reduce((acc, s) => acc + s.craftsNeeded, 0);
  const completedCraftCount = craftingSteps.filter((s) => s.missingQuantity === 0).length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Craft
            </h2>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            What you need to manufacture to complete the build objects ({completedCraftCount}/{craftingSteps.length} complete • {totalCraftOperations.toLocaleString()} total crafts needed)
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{isCopied ? 'Copied Operations!' : 'Copy Operations'}</span>
        </button>
      </div>

      {/* Crafting Operations List */}
      <div className="space-y-3">
        {craftingSteps.map((step) => {
          const isDone = step.missingQuantity === 0;
          const isExpanded = !!expandedSteps[step.outputItemId];
          const activeDetailTab = stepDetailTabs[step.outputItemId] || 'recipe';
          const isSmelting = step.recipeType === 'smelting' || step.recipeType === 'blasting' || step.recipeType === 'smoking';
          const recipeOutputQty = step.recipe?.output?.quantity || 1;
          const treeNode = buildRecipeTree(step.outputItemId, step.outputQuantity);

          const handleCraftOne = (e: React.MouseEvent) => {
            e.stopPropagation();
            const nextOwned = Math.min(step.outputQuantity, step.ownedQuantity + recipeOutputQty);
            onUpdateOwned(step.outputItemId, nextOwned);
          };

          const handleToggleComplete = (e: React.MouseEvent) => {
            e.stopPropagation();
            onUpdateOwned(step.outputItemId, isDone ? 0 : step.outputQuantity);
          };

          return (
            <div
              key={step.outputItemId}
              className={`rounded-xl border transition ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              {/* Operation Row Header */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    <ItemIcon itemId={step.outputItemId} size={30} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {step.outputName}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                        isSmelting
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {isSmelting ? <Flame className="w-2.5 h-2.5" /> : <Hammer className="w-2.5 h-2.5" />}
                        <span className="capitalize">{step.recipeType}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500 font-mono text-[11px] mt-0.5">
                      <span>Crafted: <b className="text-slate-900">{step.ownedQuantity} / {step.outputQuantity}</b></span>
                      <span>•</span>
                      <span>Remaining Crafts: <b className="text-indigo-600 font-bold">{step.craftsNeeded}x</b></span>
                      {step.extraQuantity > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">+{step.extraQuantity} surplus</span>
                        </>
                      )}
                      {step.craftableWithRaw !== undefined && step.craftableWithRaw > 0 && !isDone && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {step.craftableWithRaw} craftable with raw
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Craft Actions and Expand Toggle */}
                <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {!isDone && (
                      <button
                        type="button"
                        onClick={handleCraftOne}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title={`Craft 1 cycle (+${recipeOutputQty})`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Craft 1x</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleComplete}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition ${
                        isDone
                          ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Crafted' : 'Complete All'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(step.outputItemId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title={isExpanded ? 'Collapse' : 'Expand recipe details'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Recipe and Ingredients Viewer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl space-y-4">
                  {/* Detail Switcher Tabs */}
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setTab(step.outputItemId, 'recipe')}
                      className={`font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer ${
                        activeDetailTab === 'recipe'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Visual Recipe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab(step.outputItemId, 'tree')}
                      className={`font-semibold flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer ${
                        activeDetailTab === 'tree'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Recipe Tree</span>
                    </button>
                  </div>

                  {activeDetailTab === 'recipe' && (
                    step.recipe ? (
                      <RecipeViewer
                        recipe={step.recipe}
                        requiredQuantity={step.missingQuantity > 0 ? step.missingQuantity : step.outputQuantity}
                      />
                    ) : (
                      <div className="p-4 bg-white rounded-lg border border-slate-200 text-slate-500">
                        No recipe grid available for this item.
                      </div>
                    )
                  )}

                  {activeDetailTab === 'tree' && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <RecipeTree node={treeNode} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
