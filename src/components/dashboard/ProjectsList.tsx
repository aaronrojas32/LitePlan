import React, { useState, useMemo } from 'react';
import { Project } from '../../types/project';
import { ItemIcon } from '../ItemIcon';
import {
  Plus,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  Download,
  ArrowRight,
  FolderGit2,
} from 'lucide-react';

interface ProjectsListProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onExportProject: (project: Project) => void;
}

type SortField = 'updated' | 'name' | 'blocks' | 'progress';

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const list = projects.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sourceFilename && p.sourceFilename.toLowerCase().includes(q))
      );
    });

    list.sort((a, b) => {
      if (sortField === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortField === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortField === 'blocks') {
        return b.summary.totalBlocks - a.summary.totalBlocks;
      }
      if (sortField === 'progress') {
        return b.progress.percentage - a.progress.percentage;
      }
      return 0;
    });

    return list;
  }, [projects, searchQuery, sortField]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Build Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your Minecraft construction projects, material lists, and gathering progress
          </p>
        </div>

        <button
          type="button"
          onClick={onNewProject}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or file..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Project Name</option>
            <option value="blocks">Total Blocks</option>
            <option value="progress">Gathering Progress</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Top Section */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition shadow-2xs">
                      <ItemIcon itemId={project.thumbnail || project.materials[0]?.id || 'minecraft:stone'} size={32} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">
                        {project.sourceFilename || 'Manual Import'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Project options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === project.id && (
                      <div
                        className="absolute right-0 top-7 z-30 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs text-slate-700 font-medium"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onRenameProject(project);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateProject(project.id);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onExportProject(project);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400" /> Export
                        </button>
                        <div className="my-0.5 border-t border-slate-100"></div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteProject(project);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Blocks</span>
                    <span className="text-xs font-bold font-mono text-slate-900">{project.summary.totalBlocks.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Build Materials</span>
                    <span className="text-xs font-bold font-mono text-slate-900">{project.materials.length} items</span>
                  </div>
                </div>

                {/* Progress bar based exclusively on build objects */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 font-sans">Build Progress</span>
                    <span className="font-bold text-slate-900">
                      {project.progress.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(project.progress.percentage, 1)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{project.progress.ownedBlocks.toLocaleString()} / {project.progress.totalBlocks.toLocaleString()} blocks</span>
                    <span>{project.progress.completedMaterials} of {project.materials.length} complete</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Strip */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>
                <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  Open Build <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
          <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No projects found matching your search.</p>
        </div>
      )}
    </div>
  );
};
