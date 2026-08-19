import React from 'react';
import { AnalyzedMaterial } from '../types/material';
import { ItemIcon } from './ItemIcon';
import { Check, Plus, Minus } from 'lucide-react';
import { calculateMaterialProgress } from '../lib/calculations/progressCalculator';

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
    onUpdateOwned(material.totalRequired);
  };

  return (
    <tr
      onClick={onSelect}
      className={`group cursor-pointer transition border-b border-slate-100 dark:border-slate-800 select-none text-xs ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-blue-950/40'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'
      }`}
    >
      {/* 32px Minecraft Texture Icon */}
      <td className="py-2.5 px-3 w-12 text-center">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-0.5 mx-auto group-hover:scale-105 transition">
          <ItemIcon itemId={material.id} size={26} />
        </div>
      </td>

      {/* Material Display Name and ID */}
      <td className="py-2.5 px-3">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {material.displayName}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {material.minecraftId}
          </span>
        </div>
      </td>

      {/* Blocks Total (Base truth) */}
      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
        {material.totalRequired.toLocaleString()}
      </td>

      {/* Stacks (e.g. 19 stacks + 32) */}
      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 text-xs">
        {material.stacksRequired.formatted}
      </td>

      {/* Shulkers (e.g. 1 required) */}
      <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400">
        {material.storage.shulkersRequired}
      </td>

      {/* Interactive Owned Steppers */}
      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(e) => handleStep(e, -material.stackSize)}
            title={`Subtract 1 stack (-${material.stackSize})`}
            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="number"
            min="0"
            value={material.owned}
            onChange={handleInputChange}
            className="w-16 px-1.5 py-0.5 text-center font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={(e) => handleStep(e, material.stackSize)}
            title={`Add 1 stack (+${material.stackSize})`}
            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Missing Quantity */}
      <td className="py-2.5 px-3 text-right font-mono font-bold">
        <span className={isComplete ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}>
          {material.missing.toLocaleString()}
        </span>
      </td>

      {/* Status Badge */}
      <td className="py-2.5 px-3 text-center">
        {isComplete ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <Check className="w-3 h-3 text-emerald-600" /> Complete
          </span>
        ) : isPartial ? (
          <button
            type="button"
            onClick={handleMarkComplete}
            title="Click to complete"
            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 hover:bg-amber-100 transition"
          >
            {progress}%
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMarkComplete}
            title="Click to mark complete"
            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
          >
            Missing
          </button>
        )}
      </td>
    </tr>
  );
};
