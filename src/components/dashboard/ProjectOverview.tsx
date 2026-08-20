import React from 'react';
import { Project } from '../../types/project';
import { ItemIcon } from '../ItemIcon';
import {
  Boxes,
  Hammer,
  Pickaxe,
  Archive,
  ArrowRight,
  Check,
  Plus,
  Minus,
} from 'lucide-react';

interface ProjectOverviewProps {
  project: Project;
  onNavigateTab: (tab: 'overview' | 'build' | 'craft' | 'gather' | 'storage') => void;
  onUpdateOwned: (materialId: string, newOwned: number) => void;
  onUpdateRawOwned: (itemId: string, newOwned: number) => void;
  onSelectMaterial?: (materialId: string) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onNavigateTab,
  onUpdateOwned,
  onUpdateRawOwned,
}) => {
  const missingMaterials = project.materials
    .filter((m) => m.missing > 0)
    .slice(0, 6);

  const missingRawResources = project.rawMaterials
    .filter((r) => r.missing > 0)
    .slice(0, 6);

  const craftableItems = project.materials.filter((m) => m.craftable);
  const totalCraftOps = project.craftingSteps.reduce((acc, s) => acc + s.craftsNeeded, 0);

  return (
    <div className="space-y-6 text-xs">
      {/* 4 Core Philosophy Metric Cards: BUILD, CRAFT, GATHER, STORAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. BUILD OBJECTS */}
        <div
          onClick={() => onNavigateTab('build')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              1. BUILD
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Build Objects
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {project.progress.completedMaterials} / {project.materials.length}
            </div>
            <span className="text-xs text-slate-400">
              {project.progress.ownedBlocks.toLocaleString()} of {project.progress.totalBlocks.toLocaleString()} blocks
            </span>
          </div>
        </div>

        {/* 2. CRAFT OPERATIONS */}
        <div
          onClick={() => onNavigateTab('craft')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Hammer className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              2. CRAFT
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Crafting Needed
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {totalCraftOps.toLocaleString()} crafts
            </div>
            <span className="text-xs text-slate-400">
              across {craftableItems.length} craftable recipes
            </span>
          </div>
        </div>

        {/* 3. GATHER RESOURCES */}
        <div
          onClick={() => onNavigateTab('gather')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Pickaxe className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              3. GATHER
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Raw Resources
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {project.rawMaterials.length} items
            </div>
            <span className="text-xs text-slate-400">
              {missingRawResources.length} resources remaining to farm
            </span>
          </div>
        </div>

        {/* 4. STORAGE ALLOCATION */}
        <div
          onClick={() => onNavigateTab('storage')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              4. STORAGE
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Storage Required
            </span>
            <div className="text-2xl font-bold text-emerald-700 font-mono tracking-tight">
              {project.summary.shulkersRequired} {project.summary.shulkersRequired === 1 ? 'Shulker' : 'Shulkers'}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              or {project.summary.doubleChestsRequired} Double Chests
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Missing Build Objects & Top Raw Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Missing Build Objects */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Top Missing Build Objects
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('build')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View all Build Objects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {missingMaterials.length > 0 ? (
            <div className="space-y-2.5">
              {missingMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                      <ItemIcon itemId={mat.id} size={24} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate text-xs">
                        {mat.displayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {mat.owned} / {mat.totalRequired} ({mat.quantity.stacksFormatted})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-rose-600 text-xs">
                      {mat.missing} missing
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, Math.max(0, mat.owned - 1))}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                        title="Subtract 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, mat.owned + 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                        title="Add 1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateOwned(mat.id, mat.totalRequired)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer shadow-2xs"
                        title="Mark Complete"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 font-semibold">
              All build objects have been completely gathered!
            </div>
          )}
        </div>

        {/* Top Raw Resources to Farm */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Pickaxe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Top Raw Resources to Farm
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('gather')}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View all Raw Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {missingRawResources.length > 0 ? (
            <div className="space-y-2.5">
              {missingRawResources.map((raw) => (
                <div
                  key={raw.itemId}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                      <ItemIcon itemId={raw.itemId} size={24} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate text-xs">
                        {raw.displayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {raw.owned} / {raw.quantity} ({raw.stacks})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-amber-600 text-xs">
                      {raw.missing} to farm
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, Math.max(0, raw.owned - 64))}
                        className="px-1.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Subtract 64"
                      >
                        -64
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, raw.owned + 64)}
                        className="px-1.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px] cursor-pointer"
                        title="Add 64"
                      >
                        +64
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(raw.itemId, raw.quantity)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer shadow-2xs"
                        title="Mark Farmed"
                      >
                        <Check className="w-3 h-3" />
                        <span>Farmed</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 font-semibold">
              All raw base resources have been gathered in inventory!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
