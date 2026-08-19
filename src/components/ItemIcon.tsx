import React, { useState, useEffect } from 'react';
import { getItemIconCandidates, ICON_CACHE, recordFailedAsset } from '../lib/minecraft/itemIcons';
import { resolveItemDefinition } from '../lib/minecraft/itemResolver';
import { HelpCircle } from 'lucide-react';

interface ItemIconProps {
  itemId: string;
  size?: number;
  className?: string;
  alt?: string;
  showTooltip?: boolean;
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  itemId,
  size = 24,
  className = '',
  alt,
  showTooltip = false,
}) => {
  const candidates = getItemIconCandidates(itemId);
  const cachedUrl = ICON_CACHE.get(itemId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(cachedUrl || candidates[0] || null);

  useEffect(() => {
    const cached = ICON_CACHE.get(itemId);
    if (cached) {
      setCurrentUrl(cached);
      setHasFailedAll(false);
    } else {
      const c = getItemIconCandidates(itemId);
      setCurrentIndex(0);
      setHasFailedAll(false);
      setCurrentUrl(c[0] || null);
    }
  }, [itemId]);

  const handleError = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidates.length) {
      setCurrentIndex(nextIndex);
      setCurrentUrl(candidates[nextIndex]);
    } else {
      setHasFailedAll(true);
      recordFailedAsset(itemId);
    }
  };

  const handleSuccess = () => {
    if (currentUrl) {
      ICON_CACHE.set(itemId, currentUrl);
    }
  };

  const itemDef = resolveItemDefinition(itemId);
  const tooltipText = alt || itemDef?.displayNameEs || itemDef?.displayNameEn || itemId.replace(/^minecraft:/, '');

  if (hasFailedAll || !currentUrl) {
    return (
      <div
        title={showTooltip ? tooltipText : undefined}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`inline-flex items-center justify-center rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/80 dark:border-slate-700 select-none ${className}`}
      >
        <HelpCircle style={{ width: `${Math.max(12, size * 0.6)}px`, height: `${Math.max(12, size * 0.6)}px` }} />
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={tooltipText}
      title={showTooltip ? tooltipText : undefined}
      onError={handleError}
      onLoad={handleSuccess}
      loading="lazy"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: 'pixelated',
      }}
      className={`inline-block object-contain select-none shrink-0 transition-transform ${className}`}
    />
  );
};
