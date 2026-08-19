import React from 'react';

export type FilterCategory = 'all' | 'missing' | 'craftable' | 'raw' | 'complete' | 'unknown';

interface FilterBarProps {
  currentFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  counts: {
    all: number;
    missing: number;
    craftable: number;
    raw: number;
    complete: number;
    unknown: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const filters: Array<{ id: FilterCategory; label: string; count: number }> = [
    { id: 'all', label: 'All Items', count: counts.all },
    { id: 'missing', label: 'Missing', count: counts.missing },
    { id: 'craftable', label: 'Craftable', count: counts.craftable },
    { id: 'raw', label: 'Raw', count: counts.raw },
    { id: 'complete', label: 'Complete', count: counts.complete },
  ];

  if (counts.unknown > 0) {
    filters.push({ id: 'unknown', label: 'Unknown', count: counts.unknown });
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar text-xs">
      {filters.map((f) => {
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
