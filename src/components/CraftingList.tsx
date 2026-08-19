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
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Crafting Operations & Manufacturing
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {craftingSteps.length} recipe operations • {totalCraftOperations.toLocaleString()} total crafts needed
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
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300'
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

                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                    <ItemIcon itemId={step.outputItemId} size={28} />
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

                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                      <span>Target: <b>{step.outputQuantity}</b></span>
                      <span>•</span>
                      <span>Crafts: <b className="text-blue-600 font-bold">{step.craftsNeeded}x</b></span>
                      {step.extraQuantity > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">+{step.extraQuantity} extra surplus</span>
                        </>
                      )}
                      {step.craftableWithRaw !== undefined && (
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(step.outputItemId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Ingredients List */}
              {isExpanded && (
                <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Ingredients Required ({step.craftsNeeded} crafts):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {step.ingredients.map((ing) => (
                      <div
                        key={ing.itemId}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                            <ItemIcon itemId={ing.itemId} size={18} />
                          </div>
                          <span className="text-xs font-medium text-slate-800 truncate max-w-[120px]">
                            {ing.displayName}
                          </span>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className="font-bold text-slate-900 block">{ing.quantity}</span>
                          <span className="text-slate-400 text-[10px] block">{ing.stacks}</span>
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
