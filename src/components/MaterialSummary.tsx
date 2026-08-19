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
    <div className="w-full space-y-5 text-xs">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blocks */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Blocks
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {summary.totalBlocks.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">
              {summary.totalUniqueMaterials} unique materials
            </span>
          </div>
        </div>

        {/* Total Stacks */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Stacks
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {summary.totalStacks.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">
              inventory / chest slots
            </span>
          </div>
        </div>

        {/* Shulkers Required */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Storage Required
            </span>
            <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
              {summary.shulkersRequired} {summary.shulkersRequired === 1 ? 'Shulker' : 'Shulkers'}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              or {summary.doubleChestsRequired} {summary.doubleChestsRequired === 1 ? 'Double Chest' : 'Double Chests'}
            </span>
          </div>
        </div>

        {/* Crafting Operations */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Crafting Needed
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
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
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Base Raw Resources to Farm ({rawMaterials.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Raw materials to mine, chop, and harvest
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {rawMaterials.map((raw) => (
              <div
                key={raw.itemId}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                  <ItemIcon itemId={raw.itemId} size={22} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate text-xs">
                    {raw.displayName}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px] font-semibold">
                    {raw.quantity.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
