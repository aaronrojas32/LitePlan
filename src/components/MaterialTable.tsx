import React, { useState, useMemo } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { MaterialRow } from './MaterialRow';
import { ArrowUpDown, ArrowDown, ArrowUp, Check } from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { calculateMaterialProgress } from '../lib/calculations/progressCalculator';

interface MaterialTableProps {
  materials: AnalyzedMaterial[];
  onSelectMaterial: (material: AnalyzedMaterial) => void;
  onUpdateOwned: (materialId: string, newOwned: number) => void;
  selectedMaterialId?: string;
}

type SortColumn = 'name' | 'required' | 'owned' | 'missing' | 'stacks' | 'progress';
type SortDirection = 'asc' | 'desc';

export const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  onSelectMaterial,
  onUpdateOwned,
  selectedMaterialId,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('missing');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedMaterials = useMemo(() => {
    return [...materials].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'required':
          comparison = a.totalRequired - b.totalRequired;
          break;
        case 'owned':
          comparison = a.owned - b.owned;
          break;
        case 'missing':
          comparison = a.missing - b.missing;
          break;
        case 'stacks':
          comparison = a.totalRequired - b.totalRequired;
          break;
        case 'progress':
          comparison = calculateMaterialProgress(a.totalRequired, a.owned) - calculateMaterialProgress(b.totalRequired, b.owned);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [materials, sortColumn, sortDirection]);

  if (materials.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
        No materials found matching your filter or search query.
      </div>
    );
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-semibold select-none text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">Icon</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Material</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('required')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Blocks</span>
                  {renderSortIcon('required')}
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('stacks')}
              >
                <div className="flex items-center gap-1">
                  <span>Stacks</span>
                  {renderSortIcon('stacks')}
                </div>
              </th>
              <th className="py-3 px-3 text-center">
                <span>Shulkers</span>
              </th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('owned')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Owned</span>
                  {renderSortIcon('owned')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('missing')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Missing</span>
                  {renderSortIcon('missing')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition group"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  {renderSortIcon('progress')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <MaterialRow
                key={material.id}
                material={material}
                isSelected={selectedMaterialId === material.id}
                onSelect={() => onSelectMaterial(material)}
                onUpdateOwned={(newOwned) => onUpdateOwned(material.id, newOwned)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2.5">
        {sortedMaterials.map((material) => (
          <div
            key={material.id}
            onClick={() => onSelectMaterial(material)}
            className={`p-4 bg-white dark:bg-slate-900 rounded-xl border text-xs space-y-3 transition shadow-xs ${
              selectedMaterialId === material.id
                ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0">
                  <ItemIcon itemId={material.id} size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {material.displayName}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {material.minecraftId}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {material.totalRequired.toLocaleString()} blocks
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {material.stacksRequired.formatted}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                {material.storage.shulkerStorageFormatted}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <span className="text-slate-500 text-xs font-medium">Owned:</span>
                <input
                  type="number"
                  min="0"
                  value={material.owned}
                  onChange={(e) => onUpdateOwned(material.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-center font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                />
                <button
                  type="button"
                  onClick={() => onUpdateOwned(material.id, material.totalRequired)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  <Check className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
