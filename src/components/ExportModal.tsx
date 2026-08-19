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
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg p-5 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Export Materials
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Export Type
          </label>
          <div className="space-y-1">
            {[
              { id: 'all' as ExportType, label: 'All Materials', desc: `${materials.length} items` },
              { id: 'missing' as ExportType, label: 'Missing Materials', desc: `${materials.filter(m => m.missing > 0).length} items needed` },
              { id: 'raw_materials' as ExportType, label: 'Raw Materials', desc: `${rawMaterials.length} base resources` },
              { id: 'crafting_list' as ExportType, label: 'Crafting Operations', desc: `${craftingSteps.length} recipes` },
              { id: 'storage_list' as ExportType, label: 'Storage Allocation', desc: `Containers list` },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition ${
                  type === opt.id
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportType"
                    value={opt.id}
                    checked={type === opt.id}
                    onChange={() => setType(opt.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-2 rounded border flex items-center justify-center gap-1.5 font-medium transition ${
                format === 'csv'
                  ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              type="button"
              onClick={() => setFormat('txt')}
              className={`p-2 rounded border flex items-center justify-center gap-1.5 font-medium transition ${
                format === 'txt'
                  ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> TXT
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-500">Language:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`px-2 py-0.5 rounded font-medium ${
                lang === 'es' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded font-medium ${
                lang === 'en' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
