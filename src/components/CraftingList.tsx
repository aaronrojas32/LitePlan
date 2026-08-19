import React, { useState } from 'react';
import { CraftingStep } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { Check, Copy, ChevronDown, ChevronUp, Hammer, Flame } from 'lucide-react';

interface CraftingListProps {
  craftingSteps: CraftingStep[];
}

export const CraftingList: React.FC<CraftingListProps> = ({ craftingSteps }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  const toggleComplete = (itemId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleExpand = (itemId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCopy = () => {
    const text = craftingSteps
      .map(
        (s) =>
          `${s.craftsNeeded}x Crafts -> ${s.outputQuantity} ${s.outputName} (Produced: ${s.producedQuantity}, Extra: ${s.extraQuantity})\n` +
          s.ingredients.map((ing) => `   - ${ing.quantity} ${ing.displayName} (${ing.stacks})`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const totalCraftOperations = craftingSteps.reduce((acc, s) => acc + s.craftsNeeded, 0);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Crafting Operations & Manufacturing
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            {craftingSteps.length} recipe operations • {totalCraftOperations.toLocaleString()} total crafts needed
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{isCopied ? 'Copied Operations!' : 'Copy Operations'}</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {craftingSteps.map((step) => {
          const isDone = !!completedSteps[step.outputItemId];
          const isExpanded = !!expandedSteps[step.outputItemId];
          const isSmelting = step.recipeType === 'smelting' || step.recipeType === 'blasting' || step.recipeType === 'smoking';

          return (
            <div
              key={step.outputItemId}
              className={`rounded-xl border transition ${
                isDone
                  ? 'bg-slate-50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleComplete(step.outputItemId)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />

                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-0.5 shrink-0">
                    <ItemIcon itemId={step.outputItemId} size={28} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {step.outputName}
                      </span>
                      {isSmelting ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <Flame className="w-3 h-3 text-amber-600" /> Furnace Smelting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          <Hammer className="w-3 h-3 text-blue-600" /> Crafting Table
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Need: <b>{step.outputQuantity.toLocaleString()}</b> • Total Produced: <b>{step.producedQuantity.toLocaleString()}</b>
                      {step.extraQuantity > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 ml-1 font-semibold">
                          (+{step.extraQuantity} excess)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {step.craftsNeeded.toLocaleString()} {step.craftsNeeded === 1 ? 'craft' : 'crafts'}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      ({step.recipe?.output?.quantity || 1}x per craft)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(step.outputItemId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable ingredients list */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Ingredients needed:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {step.ingredients.map((ing) => (
                      <div
                        key={ing.itemId}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon itemId={ing.itemId} size={20} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{ing.displayName}</span>
                        </div>
                        <div className="font-mono text-right text-xs">
                          <b>{ing.quantity.toLocaleString()}</b> <span className="text-slate-400 text-[11px]">({ing.stacks})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
