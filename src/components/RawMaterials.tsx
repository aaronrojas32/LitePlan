import React, { useState } from 'react';
import { RawMaterialRequirement } from '../types/recipe';
import { ItemIcon } from './ItemIcon';
import { ChevronDown, ChevronUp, Copy, Check, Pickaxe, Plus, Minus } from 'lucide-react';

interface RawMaterialsProps {
  rawMaterials: RawMaterialRequirement[];
  onUpdateRawOwned?: (itemId: string, newOwned: number) => void;
}

export const RawMaterials: React.FC<RawMaterialsProps> = ({ rawMaterials, onUpdateRawOwned }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'names' | 'ids' | null>(null);

  const totalRawUnits = rawMaterials.reduce((acc, r) => acc + r.quantity, 0);
  const totalOwnedRaw = rawMaterials.reduce((acc, r) => acc + r.owned, 0);

  const handleCopyNames = () => {
    const text = rawMaterials
      .map((r) => `${r.quantity} ${r.displayName}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedType('names');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyIds = () => {
    const text = rawMaterials
      .map((r) => `${r.minecraftId} ${r.quantity}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedType('ids');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Pickaxe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Raw Resources to Farm
            </h2>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            {rawMaterials.length} base resources to mine, chop, and harvest ({totalRawUnits.toLocaleString()} total units · {totalOwnedRaw.toLocaleString()} farmed in inventory)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyNames}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedType === 'names' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedType === 'names' ? 'Copied List!' : 'Copy List'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyIds}
            className="px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold font-mono text-[11px] shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedType === 'ids' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-500" />}
            <span>{copiedType === 'ids' ? 'Copied IDs!' : 'Copy Minecraft IDs'}</span>
          </button>
        </div>
      </div>

      {/* Raw Resources Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rawMaterials.map((item) => {
          const isExpanded = expandedItemId === item.itemId;
          const isComplete = item.missing === 0;

          return (
            <div
              key={item.itemId}
              className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition ${
                isComplete
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0">
                      <ItemIcon itemId={item.itemId} size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {item.displayName}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.minecraftId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-slate-900 block">
                      {item.quantity.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {item.storage}
                    </span>
                  </div>
                </div>

                {/* Stepper for Raw Resources Inventory */}
                {onUpdateRawOwned && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(item.itemId, Math.max(0, item.owned - 64))}
                        className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] flex items-center gap-0.5 cursor-pointer"
                        title="Subtract 64"
                      >
                        <Minus className="w-3 h-3" /> 64
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.owned}
                        onChange={(e) => onUpdateRawOwned(item.itemId, parseInt(e.target.value) || 0)}
                        className="w-14 px-1 py-0.5 text-center font-mono text-xs bg-white border border-slate-200 rounded text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateRawOwned(item.itemId, item.owned + 64)}
                        className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] flex items-center gap-0.5 cursor-pointer"
                        title="Add 64"
                      >
                        <Plus className="w-3 h-3" /> 64
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateRawOwned(item.itemId, isComplete ? 0 : item.quantity)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        isComplete
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isComplete ? 'Farmed' : `${item.missing} left`}
                    </button>
                  </div>
                )}
              </div>

              {/* Usage Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setExpandedItemId(isExpanded ? null : item.itemId)}
                  className="w-full text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center justify-between pt-2 border-t border-slate-200/80 cursor-pointer"
                >
                  <span>Used in {item.usedIn.length} craft(s)</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
                    {item.usedIn.map((use, idx) => (
                      <div key={idx} className="pt-1 first:pt-0 flex items-center justify-between">
                        <span className="text-slate-700">{use.targetName}</span>
                        <span className="font-mono text-slate-500 font-semibold">{use.quantityRequired}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
