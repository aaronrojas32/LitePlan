import React, { useState, useMemo } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { MaterialRow } from './MaterialRow';
import { ArrowUpDown, ArrowDown, ArrowUp, Check, Plus, Minus } from 'lucide-react';
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
      <div className="w-full bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
        No build objects found matching your filter or search query.
      </div>
    );
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold select-none text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">Icon</th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Material</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('required')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Required</span>
                  {renderSortIcon('required')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('owned')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Owned</span>
                  {renderSortIcon('owned')}
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('missing')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Missing</span>
                  {renderSortIcon('missing')}
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('stacks')}
              >
                <div className="flex items-center gap-1">
                  <span>Stacks</span>
                  {renderSortIcon('stacks')}
                </div>
              </th>
              <th className="py-3 px-3 text-center">Shulkers</th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 transition group"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  {renderSortIcon('progress')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedMaterials.map((mat) => (
              <MaterialRow
                key={mat.id}
                material={mat}
                isSelected={selectedMaterialId === mat.id}
                onSelect={() => onSelectMaterial(mat)}
                onUpdateOwned={(newOwned) => onUpdateOwned(mat.id, newOwned)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedMaterials.map((mat) => {
          const isComplete = mat.missing === 0;

          return (
            <div
              key={mat.id}
              onClick={() => onSelectMaterial(mat)}
              className={`p-4 rounded-xl border bg-white shadow-2xs space-y-3 cursor-pointer transition ${
                selectedMaterialId === mat.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                    <ItemIcon itemId={mat.id} size={28} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {mat.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mat.quantity.stacksFormatted} • {mat.quantity.shulkerCompact}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 text-xs">
                    {mat.owned} / {mat.totalRequired}
                  </div>
                  <span className={`text-[11px] font-semibold ${isComplete ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isComplete ? 'Complete' : `${mat.missing} missing`}
                  </span>
                </div>
              </div>

              {/* Stepper & Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateOwned(mat.id, Math.max(0, mat.owned - 1))}
                    className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={mat.owned}
                    onChange={(e) => onUpdateOwned(mat.id, parseInt(e.target.value) || 0)}
                    className="w-14 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded py-1"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateOwned(mat.id, mat.owned + 1)}
                    className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateOwned(mat.id, isComplete ? 0 : mat.totalRequired)}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                    isComplete
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-600 text-white shadow-2xs'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isComplete ? 'Reset' : 'Done'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
