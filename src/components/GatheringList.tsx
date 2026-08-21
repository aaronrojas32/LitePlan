import React, { useState } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { RawMaterialRequirement } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { StorageBreakdownBadge } from './ui/StorageBreakdownBadge';
import { Boxes, Pickaxe, Plus, Minus, Check, Archive, Box } from 'lucide-react';

interface GatheringListProps {
  materials: AnalyzedMaterial[];
  rawMaterials: RawMaterialRequirement[];
  onUpdateOwned: (materialId: string, newOwned: number) => void;
  onUpdateRawOwned: (itemId: string, newOwned: number) => void;
}

export const GatheringList: React.FC<GatheringListProps> = ({
  materials,
  rawMaterials,
  onUpdateOwned,
  onUpdateRawOwned,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'build' | 'raw'>('raw');

  // Build Objects Checklist state
  const completedBuildCount = materials.filter((m) => m.missing === 0).length;
  const totalBuildCount = materials.length;

  // Raw Resources Checklist state
  const completedRawCount = rawMaterials.filter((r) => r.missing === 0).length;
  const totalRawCount = rawMaterials.length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs text-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Pickaxe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Gather
            </h2>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Raw materials to mine, farm, and harvest in the world, plus construction target block checklists.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
              activeSubTab === 'raw'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pickaxe className="w-3.5 h-3.5" />
            <span>Raw Resources</span>
            <span className="text-[10px] font-mono opacity-80">({completedRawCount}/{totalRawCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('build')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
              activeSubTab === 'build'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Build Objects</span>
            <span className="text-[10px] font-mono opacity-80">({completedBuildCount}/{totalBuildCount})</span>
          </button>
        </div>
      </div>

      {/* Mode A: Build Objects Gathering */}
      {activeSubTab === 'build' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs">
            <span className="text-blue-900 font-medium">
              <b>Build Objects:</b> Target blocks required for construction. Updating these directly drives overall Project Build Progress.
            </span>
            <span className="font-mono font-bold text-blue-700 shrink-0 ml-2">
              {completedBuildCount} of {totalBuildCount} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {materials.map((mat) => {
              const isComplete = mat.missing === 0;
              const stackSize = mat.stackSize || 64;
              const shulkerCapacity = 27 * stackSize;
              const doubleChestCapacity = 54 * stackSize;
              const showShulkerBtn = mat.totalRequired >= shulkerCapacity || mat.missing >= shulkerCapacity;
              const showDoubleChestBtn = mat.totalRequired >= doubleChestCapacity || mat.missing >= doubleChestCapacity;

              return (
                <div
                  key={mat.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3.5 ${
                    isComplete
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Icon, Name, and Storage Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                          <ItemIcon itemId={mat.id} size={28} />
                        </div>
                        <div>
                          <span className={`font-bold text-sm block ${isComplete ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {mat.displayName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {mat.minecraftId}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-sm text-slate-900">
                          {mat.owned.toLocaleString()} / {mat.totalRequired.toLocaleString()}
                        </div>
                        <div className={`text-[11px] font-semibold ${mat.missing > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {mat.missing > 0 ? `${mat.missing.toLocaleString()} missing` : 'Complete'}
                        </div>
                      </div>
                    </div>

                    {/* Storage Breakdown Multi-unit Pill Strip */}
                    <div className="pt-1">
                      <StorageBreakdownBadge
                        amount={mat.totalRequired}
                        stackSize={stackSize}
                        breakdown={mat.quantity}
                        variant="pill-strip"
                      />
                    </div>
                  </div>

                  {/* Quantity Steppers & Smart Action Toolbar */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Basic Stack Stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, Math.max(0, mat.owned - stackSize))}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 transition cursor-pointer"
                        title={`Subtract 1 stack (-${stackSize})`}
                      >
                        <Minus className="w-3 h-3" />
                        <span>1s</span>
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={mat.owned}
                        onChange={(e) => onUpdateOwned(mat.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, mat.owned + stackSize)}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 transition cursor-pointer"
                        title={`Add 1 stack (+${stackSize})`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>1s</span>
                      </button>
                    </div>

                    {/* Quick Container Buttons (+1 SB, +1 DC) & Complete */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {showShulkerBtn && (
                        <button
                          type="button"
                          onClick={() => onUpdateOwned(mat.id, mat.owned + shulkerCapacity)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={`Add 1 Shulker Box (+${shulkerCapacity.toLocaleString()} items / 27 stacks)`}
                        >
                          <Archive className="w-3 h-3 text-purple-600" />
                          <span>+1 SB</span>
                        </button>
                      )}

                      {showDoubleChestBtn && (
                        <button
                          type="button"
                          onClick={() => onUpdateOwned(mat.id, mat.owned + doubleChestCapacity)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={`Add 1 Double Chest (+${doubleChestCapacity.toLocaleString()} items / 54 stacks)`}
                        >
                          <Box className="w-3 h-3 text-amber-600" />
                          <span>+1 DC</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, isComplete ? 0 : mat.totalRequired)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition cursor-pointer ${
                          isComplete
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title={isComplete ? 'Reset owned to 0' : 'Mark 100% completed'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isComplete ? 'Reset' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode B: Raw Resources Gathering */}
      {activeSubTab === 'raw' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-xs">
            <span className="text-emerald-900 font-medium">
              <b>Raw Resources:</b> Base harvestable materials to farm. Tracking these manages raw inventory & crafting availability without polluting the Build Progress bar.
            </span>
            <span className="font-mono font-bold text-emerald-700 shrink-0 ml-2">
              {completedRawCount} of {totalRawCount} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rawMaterials.map((raw) => {
              const isComplete = raw.missing === 0;
              const stackSize = raw.stackSize || 64;
              const shulkerCapacity = 27 * stackSize;
              const doubleChestCapacity = 54 * stackSize;
              const showShulkerBtn = raw.quantity >= shulkerCapacity || raw.missing >= shulkerCapacity;
              const showDoubleChestBtn = raw.quantity >= doubleChestCapacity || raw.missing >= doubleChestCapacity;

              return (
                <div
                  key={raw.itemId}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3.5 ${
                    isComplete
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Icon, Name, and Storage Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                          <ItemIcon itemId={raw.itemId} size={28} />
                        </div>
                        <div>
                          <span className={`font-bold text-sm block ${isComplete ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {raw.displayName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {raw.minecraftId}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-sm text-slate-900">
                          {raw.owned.toLocaleString()} / {raw.quantity.toLocaleString()}
                        </div>
                        <div className={`text-[11px] font-semibold ${raw.missing > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {raw.missing > 0 ? `${raw.missing.toLocaleString()} to farm` : 'Fully Farmed'}
                        </div>
                      </div>
                    </div>

                    {/* Storage Breakdown Multi-unit Pill Strip */}
                    <div className="pt-1">
                      <StorageBreakdownBadge
                        amount={raw.quantity}
                        stackSize={stackSize}
                        breakdown={raw.breakdown}
                        variant="pill-strip"
                      />
                    </div>
                  </div>

                  {/* Quantity Steppers & Smart Action Toolbar */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Basic Stack Stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, Math.max(0, raw.owned - stackSize))}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 transition cursor-pointer"
                        title={`Subtract 1 stack (-${stackSize})`}
                      >
                        <Minus className="w-3 h-3" />
                        <span>1s</span>
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={raw.owned}
                        onChange={(e) => onUpdateRawOwned(raw.itemId, parseInt(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, raw.owned + stackSize)}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold flex items-center gap-0.5 transition cursor-pointer"
                        title={`Add 1 stack (+${stackSize})`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>1s</span>
                      </button>
                    </div>

                    {/* Quick Container Buttons (+1 SB, +1 DC) & Complete */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {showShulkerBtn && (
                        <button
                          type="button"
                          onClick={() => onUpdateRawOwned(raw.itemId, raw.owned + shulkerCapacity)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={`Add 1 Shulker Box (+${shulkerCapacity.toLocaleString()} items / 27 stacks)`}
                        >
                          <Archive className="w-3 h-3 text-purple-600" />
                          <span>+1 SB</span>
                        </button>
                      )}

                      {showDoubleChestBtn && (
                        <button
                          type="button"
                          onClick={() => onUpdateRawOwned(raw.itemId, raw.owned + doubleChestCapacity)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={`Add 1 Double Chest (+${doubleChestCapacity.toLocaleString()} items / 54 stacks)`}
                        >
                          <Box className="w-3 h-3 text-amber-600" />
                          <span>+1 DC</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, isComplete ? 0 : raw.quantity)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition cursor-pointer ${
                          isComplete
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title={isComplete ? 'Reset owned to 0' : 'Mark 100% farmed'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isComplete ? 'Reset' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
