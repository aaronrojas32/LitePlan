import React, { useState } from 'react';
import { Project } from '../../types/project';
import { AnalyzedMaterial } from '../../types/material';
import { ProjectOverview } from './ProjectOverview';
import { SearchBar } from '../SearchBar';
import { FilterBar, FilterCategory } from '../FilterBar';
import { MaterialTable } from '../MaterialTable';
import { CraftingList } from '../CraftingList';
import { StorageList } from '../StorageList';
import { GatheringList } from '../GatheringList';
import { MaterialDetails } from '../MaterialDetails';
import { ExportModal } from '../ExportModal';
import { ItemIcon } from '../ItemIcon';
import {
  ArrowLeft,
  Download,
  Edit3,
  Copy,
  Trash2,
  Boxes,
  Layers,
  Hammer,
  Pickaxe,
  Archive,
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateOwned: (materialId: string, newOwned: number) => void;
  onUpdateRawOwned: (itemId: string, newOwned: number) => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export type ProjectTab = 'overview' | 'build' | 'craft' | 'gather' | 'storage';

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateOwned,
  onUpdateRawOwned,
  onRename,
  onDuplicate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<AnalyzedMaterial | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filtered materials for Build tab
  const filteredMaterials = React.useMemo(() => {
    return project.materials.filter((mat) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/_/g, ' ');
        const matchesName = mat.displayName.toLowerCase().replace(/_/g, ' ').includes(q) ||
          mat.displayNameEn.toLowerCase().replace(/_/g, ' ').includes(q) ||
          mat.displayNameEs.toLowerCase().replace(/_/g, ' ').includes(q);
        const matchesId = mat.minecraftId.toLowerCase().replace(/_/g, ' ').includes(q) ||
          mat.minecraftId.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesCategory = mat.category.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCategory) return false;
      }

      if (currentFilter === 'missing') return mat.missing > 0;
      if (currentFilter === 'partial') return mat.owned > 0 && mat.missing > 0;
      if (currentFilter === 'complete') return mat.missing === 0;
      if (currentFilter === 'craftable') return mat.craftable;
      if (currentFilter === 'raw') return !mat.craftable;
      if (currentFilter === 'unknown') return mat.unrecognized === true;

      return true;
    });
  }, [project.materials, searchQuery, currentFilter]);

  const filterCounts = React.useMemo(() => {
    const mats = project.materials;
    return {
      all: mats.length,
      missing: mats.filter((m) => m.missing > 0).length,
      partial: mats.filter((m) => m.owned > 0 && m.missing > 0).length,
      complete: mats.filter((m) => m.missing === 0).length,
      craftable: mats.filter((m) => m.craftable).length,
      raw: mats.filter((m) => !m.craftable).length,
      unknown: mats.filter((m) => m.unrecognized === true).length,
    };
  }, [project.materials]);

  return (
    <div className="space-y-5">
      {/* Top Project Navigation & Hero Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
              <ItemIcon itemId={project.thumbnail || project.materials[0]?.id || 'minecraft:stone'} size={30} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <button
                  type="button"
                  onClick={onRename}
                  className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                  title="Rename Project"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {project.sourceFilename || 'Litematica'} • <b>{project.summary.totalBlocks.toLocaleString()}</b> blocks • <b>{project.materials.length}</b> build objects
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={onDuplicate}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Build Progress Bar (Exclusively driven by Build Objects) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-sans font-medium">Build Progress:</span>
              <span className="font-bold text-slate-900">
                {project.progress.ownedBlocks.toLocaleString()} / {project.progress.totalBlocks.toLocaleString()} blocks ({project.progress.percentage}%)
              </span>
            </div>

            <span className="text-slate-400">
              {project.progress.completedMaterials} of {project.progress.totalMaterials} build objects complete
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(project.progress.percentage, 1)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 5 Core Tabs Navigation Bar: Overview, Build, Craft, Gather, Storage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'overview' as const, label: 'Overview', icon: Layers },
            { id: 'build' as const, label: 'Build', icon: Boxes, count: project.materials.length },
            { id: 'craft' as const, label: 'Craft', icon: Hammer, count: project.craftingSteps.length },
            { id: 'gather' as const, label: 'Gather', icon: Pickaxe, count: project.rawMaterials.length },
            { id: 'storage' as const, label: 'Storage', icon: Archive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'build' && (
          <SearchBar query={searchQuery} onChange={setSearchQuery} />
        )}
      </div>

      {/* Tab Views */}
      {activeTab === 'overview' && (
        <ProjectOverview
          project={project}
          onNavigateTab={setActiveTab}
          onUpdateOwned={onUpdateOwned}
          onUpdateRawOwned={onUpdateRawOwned}
        />
      )}

      {activeTab === 'build' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <FilterBar
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              counts={filterCounts}
            />
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredMaterials.length} / {project.materials.length} build objects
            </span>
          </div>

          <MaterialTable
            materials={filteredMaterials}
            onSelectMaterial={setSelectedMaterial}
            onUpdateOwned={onUpdateOwned}
            selectedMaterialId={selectedMaterial?.id}
          />
        </div>
      )}

      {activeTab === 'craft' && (
        <CraftingList
          craftingSteps={project.craftingSteps}
          onUpdateOwned={onUpdateOwned}
        />
      )}

      {activeTab === 'gather' && (
        <GatheringList
          materials={project.materials}
          rawMaterials={project.rawMaterials}
          onUpdateOwned={onUpdateOwned}
          onUpdateRawOwned={onUpdateRawOwned}
        />
      )}

      {activeTab === 'storage' && (
        <StorageList materials={project.materials} />
      )}

      {/* Slide-over Detail Drawer */}
      <MaterialDetails
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        materials={project.materials}
        rawMaterials={project.rawMaterials}
        craftingSteps={project.craftingSteps}
        projectName={project.name}
      />
    </div>
  );
};
