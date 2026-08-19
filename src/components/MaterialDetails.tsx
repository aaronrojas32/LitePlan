import React, { useState } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { ItemIcon } from './ItemIcon';
import { getRecipeForItem } from '../lib/recipes/recipeDatabase';
import { buildRecipeTree } from '../lib/recipes/recipeTree';
import { getItemRawBreakdown } from '../lib/calculations/recipeCalculator';
import { RecipeViewer } from './RecipeViewer';
import { RecipeTree } from './RecipeTree';
import { X, BookOpen, GitFork, Pickaxe } from 'lucide-react';

interface MaterialDetailsProps {
  material: AnalyzedMaterial | null;
  onClose: () => void;
}

export const MaterialDetails: React.FC<MaterialDetailsProps> = ({ material, onClose }) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'tree' | 'raw'>('recipe');

  if (!material) return null;

  const recipe = getRecipeForItem(material.id);
  const recipeTree = buildRecipeTree(material.id, material.totalRequired);
  const rawBreakdown = getItemRawBreakdown(material.id, material.totalRequired);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity text-xs">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
              <ItemIcon itemId={material.id} size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {material.displayName}
                </h3>
                {material.craftable ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Craftable
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Raw Material
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {material.minecraftId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Main Quantity Banner */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Required for Build
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {material.totalRequired.toLocaleString()} blocks
            </div>
            <div className="font-mono text-slate-600 text-xs">
              {material.stacksRequired.formatted}
            </div>
            <div className="font-mono text-emerald-700 text-xs font-bold pt-1">
              {material.storage.shulkerStorageFormatted}
            </div>
          </div>

          {/* Owned & Missing Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium block">Owned in Inventory</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">
                {material.owned.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium block">Missing to Gather</span>
              <span className={`text-lg font-bold font-mono mt-0.5 block ${material.missing > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {material.missing.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                {material.stacksMissing.formatted}
              </span>
            </div>
          </div>

          {/* Recipe details */}
          {material.craftable && recipe && (
            <div className="space-y-4 pt-2">
              <div className="flex border-b border-slate-200 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('recipe')}
                  className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                    activeTab === 'recipe'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Recipe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tree')}
                  className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                    activeTab === 'tree'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GitFork className="w-4 h-4" /> Recipe Tree
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                    activeTab === 'raw'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Pickaxe className="w-4 h-4" /> Raw Resources
                </button>
              </div>

              {activeTab === 'recipe' && (
                <RecipeViewer recipe={recipe} requiredQuantity={material.totalRequired} />
              )}

              {activeTab === 'tree' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <RecipeTree node={recipeTree} />
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="space-y-2">
                  {rawBreakdown.rawMaterials.map((raw) => (
                    <div
                      key={raw.itemId}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon itemId={raw.itemId} size={22} />
                        <div>
                          <span className="font-semibold text-slate-800">{raw.displayName}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{raw.itemId}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900">{raw.quantity.toLocaleString()}</span>
                        <span className="text-slate-400 text-xs ml-1">({raw.stacks})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
