import React, { useState } from 'react';
import { RecipeTreeNode } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface RecipeTreeProps {
  node: RecipeTreeNode;
  isRoot?: boolean;
}

export const RecipeTree: React.FC<RecipeTreeProps> = ({ node, isRoot = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`text-xs ${isRoot ? 'w-full' : 'ml-4 pl-2 border-l border-slate-200'}`}>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 rounded hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center text-slate-300">
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          </div>
        )}

        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
            node.isLeaf
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <ItemIcon itemId={node.itemId} size={18} />
          <span className="font-semibold">{node.displayName}</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono font-bold text-slate-900">
            {node.totalQuantity.toLocaleString()}x
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({node.stacks})
          </span>

          {node.craftCount && node.craftCount > 0 && !node.isLeaf && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
              {node.craftCount} crafts
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
