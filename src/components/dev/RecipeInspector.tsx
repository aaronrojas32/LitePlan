import React, { useState } from 'react';
import { ItemIcon } from '../ItemIcon';
import { getRecipeForItem, getAllRecipes } from '../../data/minecraft/recipes';
import { resolveRecipeTree, getResolutionPath } from '../../lib/calculations/recipeResolutionEngine';
import { RecipeTree } from '../RecipeTree';
import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { Search, X, BookOpen, GitFork, ArrowRight } from 'lucide-react';

interface RecipeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  initialItemId?: string;
}

export const RecipeInspector: React.FC<RecipeInspectorProps> = ({
  isOpen,
  onClose,
  initialItemId = 'minecraft:piston',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialItemId);
  const [quantity, setQuantity] = useState<number>(64);

  if (!isOpen) return null;

  const normalizedItemId = searchQuery.startsWith('minecraft:') ? searchQuery : `minecraft:${searchQuery}`;
  const recipe = getRecipeForItem(normalizedItemId);
  const resolvedNode = resolveRecipeTree(normalizedItemId, quantity);
  const resolutionPath = getResolutionPath(normalizedItemId, quantity);
  const allRecipesList = getAllRecipes();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recipe Inspector & Data Explorer
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Dataset: {allRecipesList.length} Minecraft 1.21 recipes loaded
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Quantity Input */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. minecraft:piston, glass, oak_planks"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Quantity:</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Item Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs shrink-0">
                <ItemIcon itemId={normalizedItemId} size={36} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {MATERIALS_DATABASE[normalizedItemId]?.displayNameEs || normalizedItemId}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {normalizedItemId}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                recipe
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {recipe ? `CRAFTABLE (${recipe.type})` : 'TERMINAL RAW LEAF'}
              </span>
            </div>
          </div>

          {/* Linear Transformation Path */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Resolution Path Trace
            </span>
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
              {resolutionPath.map((step, idx) => (
                <React.Fragment key={`${step.itemId}-${idx}`}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <ItemIcon itemId={step.itemId} size={14} />
                    <span className="font-bold text-slate-800">{step.displayName}</span>
                    <span className="text-slate-400">({step.quantity}x)</span>
                    <span className="text-[9px] font-bold uppercase px-1 rounded bg-slate-200 text-slate-700 ml-1">
                      {step.tier}
                    </span>
                  </div>
                  {idx < resolutionPath.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Full Recursive Decomposition Tree */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Recursive Tree Decomposition
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <RecipeTree node={resolvedNode as any} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Minecraft 1.21 Dataset • Reference: minecraft.tools
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
