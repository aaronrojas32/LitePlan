import React from 'react';
import { Project } from '../../types/project';
import { ItemIcon } from '../ItemIcon';
import {
  Plus,
  ArrowRight,
  Layers,
  Boxes,
  FolderGit2,
  CheckCircle2,
  Pickaxe,
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onNewProject,
}) => {
  const totalBlocks = projects.reduce((acc, p) => acc + p.summary.totalBlocks, 0);
  const totalOwnedBlocks = projects.reduce((acc, p) => acc + p.progress.ownedBlocks, 0);
  const overallProgress = totalBlocks > 0 ? Math.round((totalOwnedBlocks / totalBlocks) * 100) : 0;

  // Active / Most recently updated project
  const activeProject = projects[0] || null;

  // Global missing raw resources across all projects
  const totalMissingRawCount = React.useMemo(() => {
    let count = 0;
    projects.forEach((p) => {
      count += p.rawMaterials.filter((r) => r.missing > 0).length;
    });
    return count;
  }, [projects]);

  return (
    <div className="space-y-6 text-xs">
      {/* Welcome Hero / Quick Action Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Minecraft Material Planner
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              v2.6
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Import your Litematica files, calculate exact crafting steps, and track gathering in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onNewProject}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 4 Focused Key Metrics (Section 29) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Projects
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Blocks Planned
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {totalBlocks.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Build Progress
            </span>
            <div className="text-xl font-extrabold text-emerald-600 font-mono">
              {overallProgress}%
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Pickaxe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Raw Resources Missing
            </span>
            <div className="text-xl font-extrabold text-amber-600 font-mono">
              {totalMissingRawCount} items
            </div>
          </div>
        </div>
      </div>

      {/* Active Build Hero Card (Section 28) */}
      {activeProject && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                <ItemIcon itemId={activeProject.thumbnail || activeProject.materials[0]?.id || 'minecraft:stone'} size={36} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Continue Your Current Build
                </span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {activeProject.name}
                </h2>
                <p className="text-slate-500 font-mono text-xs">
                  {activeProject.summary.totalBlocks.toLocaleString()} blocks • {activeProject.materials.length} build objects
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenProject(activeProject.id)}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs transition"
            >
              <span>Continue Build</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active Project Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-medium">
                {activeProject.progress.ownedBlocks.toLocaleString()} / {activeProject.progress.totalBlocks.toLocaleString()} blocks gathered
              </span>
              <span className="font-bold text-slate-900">
                {activeProject.progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(activeProject.progress.percentage, 1)}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Missing Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                <span>Missing Build Objects</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.materials.filter((m) => m.missing > 0).slice(0, 4).map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px]">
                    <ItemIcon itemId={m.id} size={14} />
                    <span className="font-semibold text-slate-800">{m.displayName}</span>
                    <span className="text-rose-600 font-bold">({m.missing})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Pickaxe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Raw Resources to Gather</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.rawMaterials.filter((r) => r.missing > 0).slice(0, 4).map((r) => (
                  <span key={r.itemId} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px]">
                    <ItemIcon itemId={r.itemId} size={14} />
                    <span className="font-semibold text-slate-800">{r.displayName}</span>
                    <span className="text-amber-600 font-bold">({r.missing})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All Projects ({projects.length})
          </h3>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                      <ItemIcon itemId={project.thumbnail || project.materials[0]?.id || 'minecraft:stone'} size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition">
                        {project.name}
                      </h4>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {project.summary.totalBlocks.toLocaleString()} blocks • {project.materials.length} objects
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {project.progress.percentage}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(project.progress.percentage, 1)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{project.progress.ownedBlocks.toLocaleString()} / {project.progress.totalBlocks.toLocaleString()} blocks</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-xl border border-slate-200 text-center space-y-3">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">No projects created yet</h4>
              <p className="text-xs text-slate-500">
                Import your first Litematica material file to start planning your build.
              </p>
            </div>
            <button
              type="button"
              onClick={onNewProject}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Import Litematica File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
