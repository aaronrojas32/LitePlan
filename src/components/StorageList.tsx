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

  const totalBlocks = storageItems.reduce((acc, m) => acc + m.totalRequired, 0);
  const totalStacks = storageItems.reduce((acc, m) => acc + m.quantity.stacksRequired, 0);
  const totalShulkers = storageItems.reduce((acc, m) => acc + m.storage.shulkersRequired, 0);
  const totalDoubleChests = storageItems.reduce((acc, m) => acc + m.storage.doubleChestsRequired, 0);

  const handleCopyStorage = () => {
    const text =
      `LITEPLAN STORAGE ALLOCATION\n` +
      `Total Blocks: ${totalBlocks.toLocaleString()}\n` +
      `Total Stacks: ${totalStacks.toLocaleString()}\n` +
      `Total Shulker Boxes: ${totalShulkers} boxes\n` +
      `Total Double Chests: ${totalDoubleChests} chests\n\n` +
      storageItems
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
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Storage
            </h2>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            How much space you'll need to carry and organize everything (27 stacks per Shulker Box, 54 stacks per Double Chest)
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyStorage}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{isCopied ? 'Copied Storage List!' : 'Copy Storage List'}</span>
        </button>
      </div>

      {/* Summary Container Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Blocks
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {totalBlocks.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            across {storageItems.length} unique materials
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Stacks
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {totalStacks.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            inventory slots required
          </span>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Shulker Boxes
            </span>
            <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
              {totalShulkers} <span className="text-xs font-sans font-medium text-emerald-600">boxes</span>
            </div>
            <span className="text-[11px] text-amber-700 font-mono">
              27 slots per box
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Archive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
              Double Chests
            </span>
            <div className="text-2xl font-bold text-blue-700 font-mono mt-1">
              {totalDoubleChests} <span className="text-xs font-sans font-medium text-blue-600">chests</span>
            </div>
            <span className="text-[11px] text-blue-700 font-mono">
              54 slots per double chest
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Box className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Item Storage Breakdown Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3.5 w-12 text-center">Icon</th>
              <th className="py-3 px-3.5">Material</th>
              <th className="py-3 px-3.5 text-right font-mono">Total Blocks</th>
              <th className="py-3 px-3.5 font-mono">Stacks</th>
              <th className="py-3 px-3.5 font-mono text-center">Shulkers</th>
              <th className="py-3 px-3.5 text-slate-500 font-medium">Storage Requirement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {storageItems.map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                <td className="py-2.5 px-3.5 text-center">
                  <div className="w-7 h-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 mx-auto">
                    <ItemIcon itemId={mat.id} size={22} />
                  </div>
                </td>
                <td className="py-2.5 px-3.5 font-bold text-slate-900">
                  {mat.displayName}
                </td>
                <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                  {mat.totalRequired.toLocaleString()}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-slate-600 text-xs">
                  {mat.quantity.stacksFormatted}
                </td>
                <td className="py-2.5 px-3.5 text-center font-mono font-bold">
                  {mat.storage.shulkersRequired > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {mat.storage.shulkersRequired}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-slate-600 font-mono text-xs">
                  {mat.storage.shulkerStorageFormatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
