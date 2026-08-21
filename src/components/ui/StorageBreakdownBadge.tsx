import React, { useState } from 'react';
import { ContainerBreakdown, calculateContainerBreakdown } from '../../lib/minecraft/storageCalculator';
import { Box, Archive, Layers } from 'lucide-react';

interface StorageBreakdownBadgeProps {
  amount: number;
  stackSize?: number;
  breakdown?: ContainerBreakdown;
  variant?: 'compact' | 'detailed' | 'pill-strip';
  showTooltip?: boolean;
}

export const StorageBreakdownBadge: React.FC<StorageBreakdownBadgeProps> = ({
  amount,
  stackSize = 64,
  breakdown: customBreakdown,
  variant = 'pill-strip',
  showTooltip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const data = customBreakdown || calculateContainerBreakdown(amount, stackSize);

  if (data.items === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
        0 items
      </span>
    );
  }

  const hasShulkers = data.fullShulkers > 0;
  const hasDoubleChests = data.fullDoubleChests > 0;

  if (variant === 'compact') {
    return (
      <div
        className="relative inline-flex items-center gap-1.5 font-mono text-xs cursor-help"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="font-bold text-slate-900">{data.items.toLocaleString()}</span>
        <span className="text-slate-400 font-normal">({data.stacksCompact})</span>

        {hasShulkers && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center gap-0.5">
            <Archive className="w-2.5 h-2.5" />
            {data.shulkerCompact}
          </span>
        )}

        {showTooltip && isHovered && (
          <div className="absolute bottom-full left-0 mb-2 z-30 w-60 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
            <div className="font-bold border-b border-slate-700 pb-1.5 flex items-center justify-between">
              <span>Container Breakdown</span>
              <span className="text-[10px] text-slate-400 font-mono">Stack: {data.stackSize}</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between items-center text-slate-200">
                <span className="flex items-center gap-1">▫️ Total items:</span>
                <span className="font-bold text-white">{data.items.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-amber-300">
                <span className="flex items-center gap-1">🧱 Stacks:</span>
                <span>{data.stacksFormatted}</span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span className="flex items-center gap-1">🟣 Shulkers (27s):</span>
                <span>{data.shulkerDetailed}</span>
              </div>
              {hasDoubleChests && (
                <div className="flex justify-between items-center text-emerald-300">
                  <span className="flex items-center gap-1">📦 Double Chests (54s):</span>
                  <span>{data.doubleChestDetailed}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant: pill-strip (multi-container pill strip for cards and dashboards)
  return (
    <div
      className="relative flex flex-wrap items-center gap-1.5 text-[11px] font-mono select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stacks Chip */}
      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1">
        <Layers className="w-3 h-3 text-slate-500" />
        <span>{data.stacksCompact}</span>
      </span>

      {/* Shulker Box Chip */}
      <span className={`px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 transition ${
        hasShulkers
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-slate-50 text-slate-500 border-slate-200/80'
      }`}>
        <Archive className={`w-3 h-3 ${hasShulkers ? 'text-purple-600' : 'text-slate-400'}`} />
        <span>{data.shulkerCompact}</span>
      </span>

      {/* Double Chest Chip (if volume >= 54 stacks) */}
      {hasDoubleChests && (
        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1">
          <Box className="w-3 h-3 text-amber-600" />
          <span>{data.doubleChestCompact}</span>
        </span>
      )}

      {/* Hover popover */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-0 mb-2 z-30 w-64 bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="font-bold border-b border-slate-700 pb-1.5 flex items-center justify-between">
            <span className="text-white text-xs">Storage Calculations</span>
            <span className="text-[10px] text-slate-400 font-mono">1 Stack = {data.stackSize}</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-200">
              <span>▫️ Base blocks:</span>
              <span className="font-bold text-white">{data.items.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>🧱 Stacks & items:</span>
              <span>{data.stacksFormatted}</span>
            </div>
            <div className="flex justify-between items-center text-purple-300">
              <span>🟣 Shulkers (27 stacks):</span>
              <span>{data.shulkerDetailed}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-300">
              <span>📦 Double Chests (54 stacks):</span>
              <span>{data.doubleChestDetailed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
