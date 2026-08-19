import React, { useState } from 'react';
import { AnalyzedMaterial } from '../types/material';
import { RawMaterialRequirement, CraftingStep } from '../types/recipe';
import { ExportFormat, ExportType } from '../types/export';
import { exportToCSV, triggerDownload } from '../lib/export/csvExporter';
import { exportToTXT } from '../lib/export/txtExporter';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: AnalyzedMaterial[];
  rawMaterials: RawMaterialRequirement[];
  craftingSteps: CraftingStep[];
  projectName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  materials,
  rawMaterials,
  craftingSteps,
  projectName = 'materials',
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [type, setType] = useState<ExportType>('all');
  const [lang, setLang] = useState<'es' | 'en'>('es');

  if (!isOpen) return null;

  const handleExport = () => {
    const safeName = projectName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_${type}.${format}`;

    if (format === 'csv') {
      const csvContent = exportToCSV(materials, rawMaterials, craftingSteps, { type, format, language: lang });
      triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
    } else {
      const txtContent = exportToTXT(materials, rawMaterials, craftingSteps, { type, format, language: lang });
      triggerDownload(txtContent, filename, 'text/plain;charset=utf-8;');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs text-xs">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-slate-200 space-y-4 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Export Materials & Plans
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Export Scope
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'all' as ExportType, label: 'All Build Objects', desc: `${materials.length} items` },
              { id: 'missing' as ExportType, label: 'Missing Materials Only', desc: `${materials.filter(m => m.missing > 0).length} needed` },
              { id: 'raw_materials' as ExportType, label: 'Raw Base Resources', desc: `${rawMaterials.length} resources` },
              { id: 'crafting_list' as ExportType, label: 'Crafting Operations', desc: `${craftingSteps.length} recipes` },
              { id: 'storage_list' as ExportType, label: 'Storage Box Allocation', desc: `Containers list` },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                  type === opt.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportType"
                    value={opt.id}
                    checked={type === opt.id}
                    onChange={() => setType(opt.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() => setFormat('txt')}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition cursor-pointer ${
                  format === 'txt'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> TXT
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Language
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`p-2 rounded-lg border font-semibold transition cursor-pointer ${
                  lang === 'es'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`p-2 rounded-lg border font-semibold transition cursor-pointer ${
                  lang === 'en'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .{format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
