import React, { useState } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { ItemIcon } from './ItemIcon';
import { Copy, Check, Archive, Box } from 'lucide-react';

interface StorageListProps {
  materials: AnalyzedMaterial[];
}

export const StorageList: React.FC<StorageListProps> = ({ materials }) => {
  const [isCopied, setIsCopied] = useState(false);

  const storageItems = materials
    .filter((m) => m.totalRequired > 0)
    .sort((a, b) => b.totalRequired - a.totalRequired);

  const totalShulkers = storageItems.reduce((acc, m) => acc + m.storage.shulkersRequired, 0);
  const totalDoubleChests = storageItems.reduce((acc, m) => acc + m.storage.doubleChestsRequired, 0);

  const handleCopyStorage = () => {
    const text = storageItems
      .map(
        (m) =>
          `${m.displayName} (${m.totalRequired} blocks):\n` +
          `  - Stacks: ${m.stacksRequired.formatted}\n` +
          `  - Storage: ${m.storage.shulkerStorageFormatted}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Storage & Container Allocation
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Physical containers required to store all required materials (27 stacks per Shulker Box, 54 stacks per Double Chest)
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyStorage}
          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{isCopied ? 'Copied Storage List!' : 'Copy Storage List'}</span>
        </button>
      </div>

      {/* Summary Container Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block uppercase tracking-wider">
                Shulker Boxes Required
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Allocating dedicated box per item type
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-200">
            {totalShulkers} {totalShulkers === 1 ? 'Box' : 'Boxes'}
          </div>
        </div>

        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block uppercase tracking-wider">
                Double Chests Required
              </span>
              <span className="text-[11px] text-blue-700 dark:text-blue-400">
                Allocating dedicated chest per item type
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-950 dark:text-blue-200">
            {totalDoubleChests} {totalDoubleChests === 1 ? 'Chest' : 'Chests'}
          </div>
        </div>
      </div>

      {/* Grid of Items and their storage breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {storageItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0">
                <ItemIcon itemId={item.id} size={26} />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {item.displayName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {item.stacksRequired.formatted}
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {item.totalRequired.toLocaleString()} blocks
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                {item.storage.shulkerStorageFormatted}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
