import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, ShieldAlert, RefreshCw, Database, BookOpen } from 'lucide-react';
import { exportLitePlanBackup, importLitePlanBackup, clearAllData } from '../../lib/storage/projectStore';
import { useToast } from '../../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  onOpenInspector?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  onOpenInspector,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const json = await exportLitePlanBackup();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `liteplan-backup-${timestamp}.json`;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Backup exported as JSON', 'success');
    } catch {
      showToast('Failed to export backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importLitePlanBackup(text);
        if (res.success) {
          showToast(`Imported ${res.importedCount} project(s) from backup`, 'success');
          onDataChanged();
        } else {
          showToast(res.error || 'Failed to import backup', 'error');
        }
      } catch {
        showToast('Error reading backup file', 'error');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    await clearAllData();
    setConfirmClear(false);
    showToast('All local data cleared', 'info');
    onDataChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-xs">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Settings & Data Management
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Tools & Recipe Explorer */}
        {onOpenInspector && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Recipe Database
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInspector();
              }}
              className="w-full p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-semibold text-slate-900 block">Recipe Inspector</span>
                  <span className="text-[10px] text-slate-500 block">Explore Minecraft 1.21 recipes & trees</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600">Open &rarr;</span>
            </button>
          </div>
        )}

        {/* Section 2: Data Backup */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Backup & Sync
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={isExporting}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                <span>Export Backup</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Download full JSON file</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition cursor-pointer"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Import Backup</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Restore from JSON file</span>
            </button>
          </div>
        </div>

        {/* Section 3: Danger Zone */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Danger Zone
          </label>
          {confirmClear ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Delete ALL local projects and settings?</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Local Storage</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
