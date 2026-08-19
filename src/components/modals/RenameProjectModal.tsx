import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface RenameProjectModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  isOpen,
  currentName,
  onClose,
  onRename,
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-xs">
      <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Rename Project
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              New Project Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
