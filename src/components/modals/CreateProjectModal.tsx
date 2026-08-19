import React, { useState } from 'react';
import { X, FileText, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SAMPLE_NETHER_PORTAL_TXT, SAMPLE_NETHER_PORTAL_CSV, SAMPLE_REDSTONE_FACTORY_CSV } from '../../data/sampleData';
import { parseLitematicaFile } from '../../lib/parser';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, content: string, filename: string, description: string) => Promise<void>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [filename, setFilename] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFilename(file.name);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const loadSample = (type: 'nether_txt' | 'nether_csv' | 'redstone') => {
    if (type === 'nether_txt') {
      setFileContent(SAMPLE_NETHER_PORTAL_TXT);
      setFilename('portal_nether.txt');
      if (!name) setName('Nether Portal Base');
      if (!description) setDescription('Gothic nether portal build');
    } else if (type === 'nether_csv') {
      setFileContent(SAMPLE_NETHER_PORTAL_CSV);
      setFilename('portal_nether.csv');
      if (!name) setName('Nether Portal Outpost');
    } else {
      setFileContent(SAMPLE_REDSTONE_FACTORY_CSV);
      setFilename('redstone_contraption.csv');
      if (!name) setName('Redstone Facility');
      if (!description) setDescription('Piston and hopper item collection');
    }
  };

  // Preview parsed stats if file content is available
  const parsedPreview = React.useMemo(() => {
    if (!fileContent) return null;
    try {
      const parsed = parseLitematicaFile(fileContent, filename || 'preview.csv');
      return {
        blocks: parsed.summary.totalBlocks,
        materials: parsed.materials.length,
      };
    } catch {
      return null;
    }
  }, [fileContent, filename]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) return;

    setIsProcessing(true);
    try {
      await onCreate(
        name.trim() || filename.replace(/\.[^/.]+$/, ''),
        fileContent,
        filename || 'materials.csv',
        description.trim()
      );
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs text-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Build Project
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Import a Litematica export (.csv or .txt) to plan resources
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Medieval Castle, Nether Hub..."
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or coordinates..."
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Litematica Material List (.csv or .txt) *
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40'
              }`}
            >
              {fileContent ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileContent('');
                        setFilename('');
                      }}
                      className="text-slate-400 hover:text-rose-600 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  {parsedPreview && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>File successfully parsed</span>
                      </div>
                      <div className="font-mono text-emerald-900 dark:text-emerald-200">
                        <b>{parsedPreview.blocks.toLocaleString()}</b> blocks · <b>{parsedPreview.materials}</b> materials
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-500">
                    <label className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                      Click to choose file
                      <input
                        type="file"
                        accept=".csv,.txt,.tsv"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>{' '}
                    or drag and drop here
                  </div>
                </div>
              )}
            </div>

            {/* Quick sample buttons */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
              <span>Or try a sample build:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSample('nether_txt')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Nether Portal
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('redstone')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Redstone Contraption
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fileContent || isProcessing}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
