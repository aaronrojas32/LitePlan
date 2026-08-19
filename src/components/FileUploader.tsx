import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { ParseResult } from '../types/parser';
import { parseLitematicaFile } from '../lib/parser';
import { SAMPLE_NETHER_PORTAL_TXT, SAMPLE_NETHER_PORTAL_CSV, SAMPLE_REDSTONE_FACTORY_CSV } from '../data/sampleData';

interface FileUploaderProps {
  onParsed: (result: ParseResult) => void;
  currentResult: ParseResult | null;
  onReset?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onParsed, currentResult }) => {
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
      }, 200);
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
        filename = 'redstone_facility.csv';
      }

      try {
        const result = parseLitematicaFile(content, filename);
        onParsed(result);
      } catch (err) {
        console.error('Failed to load sample', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 200);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
            : currentResult
            ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".csv,.txt,.tsv"
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="space-y-2 py-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="font-semibold text-slate-700">Analyzing Litematica Export...</p>
            <p className="text-slate-400 text-[11px]">Extracting quantities, matching crafting recipes & raw resources</p>
          </div>
        ) : currentResult ? (
          <div className="space-y-2 py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{currentResult.filename}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                {currentResult.summary.totalBlocks.toLocaleString()} blocks • {currentResult.materials.length} unique materials ({currentResult.format.toUpperCase()})
              </p>
            </div>
            <p className="text-blue-600 font-semibold text-[11px] pt-1">
              Click or drop another file to replace
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">
                Drag and drop your Litematica export here
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Supports <span className="font-mono text-slate-600">.csv</span>, <span className="font-mono text-slate-600">.txt</span> ASCII tables, and <span className="font-mono text-slate-600">.tsv</span>
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
            >
              Browse Computer
            </button>
          </>
        )}
      </div>

      {/* Quick samples bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Or try built-in sample builds:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSample('portal_txt');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            Nether Portal (.txt)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSample('portal_csv');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            Nether Portal (.csv)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSample('redstone');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            Redstone Contraption
          </button>
        </div>
      </div>
    </div>
  );
};
