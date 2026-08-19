import React, { useRef, useState } from 'react';
import { X, Sun, Moon, Laptop, Download, Upload, Trash2, ShieldAlert, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { exportLitePlanBackup, importLitePlanBackup, clearAllData } from '../../lib/storage/projectStore';
import { useToast } from '../../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const { theme, setTheme } = useTheme();
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs text-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg p-5 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Appearance */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light' as const, label: 'Light', icon: Sun },
              { id: 'dark' as const, label: 'Dark', icon: Moon },
              { id: 'system' as const, label: 'System', icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded border flex flex-col items-center gap-1.5 transition font-medium ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Data Backup */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Backup & Data
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={isExporting}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded text-left transition"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Export Backup</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Download JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded text-left transition"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Import Backup</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Restore from JSON</span>
            </button>
          </div>
        </div>

        {/* Section 3: Reset */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {confirmClear ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Delete ALL local projects and settings?</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5"
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
