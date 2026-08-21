import React, { useState, useEffect } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { ItemIcon } from './ItemIcon';
import { getRecipeForItem, getAllRecipesForItem } from '../lib/recipes/recipeDatabase';
import { buildRecipeTree } from '../lib/recipes/recipeTree';
import { getItemRawBreakdown } from '../lib/calculations/recipeCalculator';
import { RecipeViewer } from './RecipeViewer';
import { RecipeTree } from './RecipeTree';
import { X, BookOpen, GitFork, Pickaxe, Sparkles, Compass, Archive, Box, Layers } from 'lucide-react';
import { Recipe } from '../types/recipe';

interface MaterialDetailsProps {
  material: AnalyzedMaterial | null;
  onClose: () => void;
}

export const MaterialDetails: React.FC<MaterialDetailsProps> = ({ material, onClose }) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'tree' | 'raw'>('recipe');

  const allRecipes = material ? getAllRecipesForItem(material.id) : [];
  const primaryRecipe = material ? (getRecipeForItem(material.id) || allRecipes[0]) : undefined;
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(primaryRecipe);

  useEffect(() => {
    if (material) {
      const recs = getAllRecipesForItem(material.id);
      setSelectedRecipe(getRecipeForItem(material.id) || recs[0]);
    }
  }, [material]);

  if (!material) return null;

  const hasRecipes = allRecipes.length > 0;
  const recipeTree = buildRecipeTree(material.id, material.totalRequired);
  const rawBreakdown = getItemRawBreakdown(material.id, material.totalRequired);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity text-xs">
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
                ) : hasRecipes ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Recipe Available
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Natural Resource
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
          {/* Main 4-Tier Quantity & Storage Grid */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Required for Construction
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                1 Stack = {material.stackSize}
              </span>
            </div>

            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {material.totalRequired.toLocaleString()} <span className="text-sm font-semibold text-slate-500 font-sans">blocks</span>
            </div>

            {/* 4-Tier Container Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-sans font-medium flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-500" /> Stacks & Items
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {material.quantity.stacksFormatted}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-sans font-medium flex items-center gap-1">
                  <Archive className="w-3 h-3 text-purple-600" /> Shulker Boxes
                </span>
                <span className="text-xs font-bold text-purple-700 block">
                  {material.quantity.shulkerCompact}
                </span>
              </div>

              <div className="col-span-2 p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-sans font-medium flex items-center gap-1">
                  <Box className="w-3 h-3 text-amber-600" /> Double Chest Capacity
                </span>
                <span className="text-xs font-bold text-amber-800 block">
                  {material.quantity.doubleChestCompact}
                </span>
              </div>
            </div>
          </div>

          {/* Owned & Missing Stats */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-sans font-medium block">In Inventory / Chests</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {material.owned.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {material.owned === 0 ? '0 stacks' : `${Math.floor(material.owned / material.stackSize)}s ${material.owned % material.stackSize}`}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-sans font-medium block">Missing to Collect</span>
              <span className={`text-lg font-bold mt-0.5 block ${material.missing > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {material.missing.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {material.quantityMissing.stacksCompact}
              </span>
            </div>
          </div>

          {/* Source and Natural Occurrence Info */}
          {material.source && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Provenance & Acquisition Methods</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                {material.source}
              </p>
            </div>
          )}

          {/* Recipe details */}
          {hasRecipes && selectedRecipe && (
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
                  <BookOpen className="w-4 h-4" /> Recipe & Methods
                  {allRecipes.length > 1 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono font-bold">
                      {allRecipes.length}
                    </span>
                  )}
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
                  <GitFork className="w-4 h-4" /> Crafting Tree
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
                  <Pickaxe className="w-4 h-4" /> Raw Materials
                </button>
              </div>

              {activeTab === 'recipe' && (
                <RecipeViewer
                  recipe={selectedRecipe}
                  availableRecipes={allRecipes}
                  requiredQuantity={material.totalRequired}
                  onSelectRecipe={(r) => setSelectedRecipe(r)}
                />
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
