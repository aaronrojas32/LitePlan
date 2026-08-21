import React from 'react';
import { AnalyzedMaterial } from '../types/material';
import { ItemIcon } from './ItemIcon';
import { Check, Plus, Minus } from 'lucide-react';
import { calculateMaterialProgress } from '../lib/calculations/progressCalculator';
import { StorageBreakdownBadge } from './ui/StorageBreakdownBadge';

interface MaterialRowProps {
  material: AnalyzedMaterial;
  isSelected?: boolean;
  onSelect: () => void;
  onUpdateOwned: (newOwned: number) => void;
}

export const MaterialRow: React.FC<MaterialRowProps> = ({
  material,
  isSelected,
  onSelect,
  onUpdateOwned,
}) => {
  const isComplete = material.missing === 0;
  const isPartial = material.owned > 0 && !isComplete;
  const progress = calculateMaterialProgress(material.totalRequired, material.owned);

  const handleStep = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const current = material.owned || 0;
    const next = Math.max(0, current + delta);
    onUpdateOwned(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseInt(e.target.value, 10);
    onUpdateOwned(isNaN(val) ? 0 : Math.max(0, val));
  };

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateOwned(isComplete ? 0 : material.totalRequired);
  };

  return (
    <tr
      onClick={onSelect}
      className={`group cursor-pointer transition border-b border-slate-100 select-none text-xs ${
        isSelected
          ? 'bg-blue-50/80'
          : 'hover:bg-slate-50/80 bg-white'
      }`}
    >
      {/* 32px Minecraft Texture Icon */}
      <td className="py-2.5 px-3 w-12 text-center">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 mx-auto group-hover:scale-105 transition shadow-2xs">
          <ItemIcon itemId={material.id} size={26} />
        </div>
      </td>

      {/* Material Display Name and ID */}
      <td className="py-2.5 px-3">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
            {material.displayName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {material.minecraftId}
          </span>
        </div>
      </td>

      {/* Required Base Blocks */}
      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
        {material.totalRequired.toLocaleString()}
      </td>

      {/* Owned with Stepper Controls */}
      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            type="button"
            onClick={(e) => handleStep(e, -1)}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Subtract 1"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            min="0"
            value={material.owned}
            onChange={handleInputChange}
            className="w-14 px-1 text-center font-mono text-xs bg-transparent border-none text-slate-900 focus:outline-none font-bold"
          />
          <button
            type="button"
            onClick={(e) => handleStep(e, 1)}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Add 1"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Missing Blocks Count */}
      <td className="py-2.5 px-3 text-right font-mono font-bold">
        {isComplete ? (
          <span className="text-emerald-600">0</span>
        ) : (
          <span className="text-rose-600">
            {material.missing.toLocaleString()}
          </span>
        )}
      </td>

      {/* Stacks Breakdown */}
      <td className="py-2.5 px-3 font-mono text-slate-600 text-xs">
        <StorageBreakdownBadge
          amount={material.totalRequired}
          stackSize={material.stackSize}
          breakdown={material.quantity}
          variant="compact"
        />
      </td>

      {/* Storage Containers (Shulkers) */}
      <td className="py-2.5 px-3 text-center font-mono text-xs">
        {material.quantity.fullShulkers > 0 || material.quantity.shulkersRequired > 0 ? (
          <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1">
            {material.quantity.shulkerCompact}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>

      {/* Status Chip & Quick Complete Action */}
      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-1.5">
          {isComplete ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3" />
              <span>Complete</span>
            </span>
          ) : isPartial ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Partial ({progress}%)
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Missing
            </span>
          )}

          <button
            type="button"
            onClick={handleMarkComplete}
            className={`p-1 rounded-md transition cursor-pointer ${
              isComplete
                ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={isComplete ? 'Reset quantity to 0' : 'Mark 100% complete'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
