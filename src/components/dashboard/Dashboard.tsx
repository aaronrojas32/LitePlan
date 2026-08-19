import React from 'react';
import { Project } from '../../types/project';
import { ItemIcon } from '../ItemIcon';
import { Plus, ArrowRight, Layers, Boxes, FolderGit2, CheckCircle2, Sparkles, Pickaxe } from 'lucide-react';

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
  const totalMaterials = projects.reduce((acc, p) => acc + p.summary.totalUniqueMaterials, 0);
  const totalOwnedBlocks = projects.reduce((acc, p) => acc + p.progress.ownedBlocks, 0);
  const overallProgress = totalBlocks > 0 ? Math.round((totalOwnedBlocks / totalBlocks) * 100) : 0;

  // Aggregate top raw resources across projects for quick overview
  const globalRawItems = React.useMemo(() => {
    const map = new Map<string, { itemId: string; displayName: string; quantity: number }>();
    projects.forEach((p) => {
      p.rawMaterials.forEach((r) => {
        const curr = map.get(r.itemId) || { itemId: r.itemId, displayName: r.displayName, quantity: 0 };
        curr.quantity += r.quantity;
        map.set(r.itemId, curr);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Welcome Hero / Quick Action Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Minecraft Build Planner
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

      {/* Global Overview Stat Cards */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Builds
              </span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Blocks
              </span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {totalBlocks.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Build Objects
              </span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {totalMaterials.toLocaleString()} items
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Gathering
              </span>
              <div className="text-xl font-extrabold text-emerald-600 font-mono">
                {overallProgress}%
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Projects + Resource Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Projects
            </h2>
            {projects.length > 0 && (
              <span className="text-xs text-slate-500">
                {projects.length} active
              </span>
            )}
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition shadow-2xs">
                          <ItemIcon itemId={project.thumbnail || project.materials[0]?.id || 'minecraft:stone'} size={32} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                            {project.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5 truncate">
                            {project.sourceFilename || 'Manual Import'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5 shrink-0">
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Metric Chips */}
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

                    {/* Clean Progress Meter */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 font-sans">Build Progress</span>
                        <span className="font-semibold text-slate-900">
                          {project.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(project.progress.percentage, 1)}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 text-right">
                        {project.progress.ownedBlocks.toLocaleString()} / {project.progress.totalBlocks.toLocaleString()} blocks
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="truncate max-w-[140px]">{project.sourceFilename || 'Manual'}</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No active projects
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Import a Litematica export (.csv or .txt) to calculate required materials, crafting tree, and storage boxes.
              </p>
              <button
                type="button"
                onClick={onNewProject}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Top Raw Resources to Farm */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pickaxe className="w-4 h-4 text-emerald-600" />
              <span>Top Raw Resources</span>
            </h2>
            <span className="text-xs text-slate-400">
              Base materials to farm
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 divide-y divide-slate-100">
            {globalRawItems.length > 0 ? (
              globalRawItems.map((raw) => (
                <div key={raw.itemId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
                      <ItemIcon itemId={raw.itemId} size={20} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {raw.displayName}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {raw.quantity.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No materials registered yet. Create a project to view raw resource breakdowns.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
