import React, { useState } from 'react';
import { RecipeTreeNode } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { ChevronRight, ChevronDown, Hammer, Flame, Pickaxe, Boxes } from 'lucide-react';

interface RecipeTreeProps {
  node: RecipeTreeNode;
  isRoot?: boolean;
}

export const RecipeTree: React.FC<RecipeTreeProps> = ({ node, isRoot = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSmelting = node.recipeType === 'smelting' || node.recipeType === 'blasting' || node.recipeType === 'smoking';

  return (
    <div className={`text-xs ${isRoot ? 'w-full' : 'ml-4 pl-2.5 border-l border-slate-200'}`}>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center text-slate-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </div>
        )}

        <div
          className={`flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg border shadow-2xs ${
            node.tier === 'RAW' || node.isLeaf
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : node.tier === 'BUILD'
              ? 'bg-blue-50/80 border-blue-200 text-blue-900'
              : isSmelting
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <ItemIcon itemId={node.itemId} size={18} />
          <span className="font-bold">{node.displayName}</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono font-bold">
            {node.totalQuantity.toLocaleString()}x
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            ({node.stacks})
          </span>

          {/* Tier / Process Badges */}
          {node.tier === 'RAW' || node.isLeaf ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
              <Pickaxe className="w-2.5 h-2.5" />
              <span>RAW</span>
            </span>
          ) : node.tier === 'BUILD' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded border border-blue-300">
              <Boxes className="w-2.5 h-2.5" />
              <span>BUILD TARGET</span>
            </span>
          ) : isSmelting ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300">
              <Flame className="w-2.5 h-2.5" />
              <span>SMELTING</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
              <Hammer className="w-2.5 h-2.5" />
              <span>CRAFTING</span>
            </span>
          )}

          {node.craftCount && node.craftCount > 0 && !node.isLeaf && (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
              {node.craftCount}x cycles
            </span>
          )}

          {node.extraQuantity && node.extraQuantity > 0 && (
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
              +{node.extraQuantity} surplus
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {node.children!.map((child, idx) => (
            <RecipeTree key={`${child.itemId}-${idx}`} node={child} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
};
