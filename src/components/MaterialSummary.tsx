import React from 'react';
import { BuildSummary } from '../types/parser';
import { RawMaterialRequirement } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { Layers, Boxes, Archive, Hammer, Pickaxe } from 'lucide-react';

interface MaterialSummaryProps {
  summary: BuildSummary;
  rawMaterials: RawMaterialRequirement[];
}

export const MaterialSummary: React.FC<MaterialSummaryProps> = ({ summary, rawMaterials }) => {
  return (
    <div className="w-full space-y-5">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blocks */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Blocks
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {summary.totalBlocks.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">
              {summary.totalUniqueMaterials} unique materials
            </span>
          </div>
        </div>

        {/* Total Stacks */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Stacks
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {summary.totalStacks.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">
              inventory / chest slots
            </span>
          </div>
        </div>

        {/* Shulkers Required */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Storage Required
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {summary.shulkersRequired} {summary.shulkersRequired === 1 ? 'Shulker' : 'Shulkers'}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              or {summary.doubleChestsRequired} {summary.doubleChestsRequired === 1 ? 'Double Chest' : 'Double Chests'}
            </span>
          </div>
        </div>

        {/* Crafting Operations */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Crafting Needed
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {summary.totalCraftingOperations.toLocaleString()} crafts
            </div>
            <span className="text-xs text-slate-400">
              across {summary.uniqueRecipesCount} recipes
            </span>
          </div>
        </div>
      </div>

      {/* Raw Materials Bar */}
      {rawMaterials.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Base Raw Resources to Farm ({rawMaterials.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Recursive raw material decomposition
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {rawMaterials.map((raw) => (
              <div
                key={raw.itemId}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs shrink-0"
              >
                <ItemIcon itemId={raw.itemId} size={20} />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {raw.displayName}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {raw.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
