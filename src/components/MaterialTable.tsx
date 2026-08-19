import React, { useState, useMemo } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { MaterialRow } from './MaterialRow';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
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
        No materials found matching your filter or search query.
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
                  <span>Blocks</span>
                  {renderSortIcon('required')}
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
              <th className="py-3 px-3 text-center">
                <span>Shulkers</span>
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

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-2.5">
        {sortedMaterials.map((mat) => (
          <div
            key={mat.id}
            onClick={() => onSelectMaterial(mat)}
            className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs text-slate-900">{mat.displayName}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                mat.missing === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : mat.owned > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {mat.missing === 0 ? 'Complete' : `${mat.missing} missing`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1.5 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block">Required</span>
                <span className="font-mono font-bold text-slate-800">{mat.totalRequired}</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block">Owned</span>
                <span className="font-mono font-bold text-slate-800">{mat.owned}</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded">
                <span className="text-[10px] text-slate-400 block">Stacks</span>
                <span className="font-mono text-slate-600 text-[11px]">{mat.quantity.stacksFormatted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
