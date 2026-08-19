import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { ParseResult } from '../types/parser';
import { parseLitematicaFile } from '../lib/parser';
import { SAMPLE_NETHER_PORTAL_TXT, SAMPLE_NETHER_PORTAL_CSV, SAMPLE_REDSTONE_FACTORY_CSV } from '../data/sampleData';

interface FileUploaderProps {
  onParsed: (result: ParseResult) => void;
  currentResult: ParseResult | null;
  onReset?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onParsed, currentResult, onReset }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTimeout(() => {
        try {
          const result = parseLitematicaFile(content, file.name);
          onParsed(result);
        } catch (err) {
          console.error('Failed to parse file', err);
        } finally {
          setIsAnalyzing(false);
        }
      }, 250); // slight smooth delay for realistic UX feedback
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadSample = (sampleType: 'portal_txt' | 'portal_csv' | 'redstone') => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let content = '';
      let filename = '';
      if (sampleType === 'portal_txt') {
        content = SAMPLE_NETHER_PORTAL_TXT;
        filename = 'portal_nether_materials.txt';
      } else if (sampleType === 'portal_csv') {
        content = SAMPLE_NETHER_PORTAL_CSV;
        filename = 'portal_nether_materials.csv';
      } else {
        content = SAMPLE_REDSTONE_FACTORY_CSV;
        filename = 'redstone_contraption.csv';
      }
      const result = parseLitematicaFile(content, filename);
      onParsed(result);
      setIsAnalyzing(false);
    }, 200);
  };

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 bg-white ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 shadow-md scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".csv,.txt,.tsv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            {isAnalyzing ? (
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800">
              Import your Litematica material list
            </h3>
            <p className="text-sm text-slate-500">
              Drag & drop your CSV or TXT export here, or select from your computer
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all"
            >
              Select File (.csv, .txt)
            </button>
            {currentResult && onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick sample loader buttons for instant test */}
          <div className="pt-2 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or try a sample build:
            </span>
            <div className="flex gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => loadSample('portal_txt')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Portal Nether (TXT)
              </button>
              <button
                type="button"
                onClick={() => loadSample('portal_csv')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Portal Nether (CSV)
              </button>
              <button
                type="button"
                onClick={() => loadSample('redstone')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Redstone Contraption
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File status & parsing results banner */}
      {currentResult && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{currentResult.filename}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono uppercase">
                  {currentResult.format}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentResult.rawRowCount} lines parsed • {currentResult.materials.length} unique materials detected
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{currentResult.summary.totalBlocks.toLocaleString()} total materials detected</span>
            </div>
          </div>
        </div>
      )}

      {/* Unrecognized items notification without dropping them */}
      {currentResult && currentResult.unrecognized.length > 0 && (
        <div className="mt-3 p-4 rounded-xl border border-amber-200 bg-amber-50/70 shadow-sm text-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{currentResult.unrecognized.length} material(s) could not be identified automatically</span>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            These items are still preserved and displayed in your list, but recipe resolution is not available for them:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {currentResult.unrecognized.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-amber-300 text-amber-900 shadow-xs"
              >
                {item.rawName} ({item.total.toLocaleString()} units)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
