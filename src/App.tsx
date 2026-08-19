import { useState, useEffect, useCallback } from 'react';
import { Project } from './types/project';
import {
  getAllProjects,
  createProjectFromImport,
  duplicateProject,
  deleteProject,
  saveProject,
  updateProjectOwnedMap,
} from './lib/storage/projectStore';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Logo } from './components/Logo';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectsList } from './components/dashboard/ProjectsList';
import { ProjectDetail } from './components/dashboard/ProjectDetail';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { RenameProjectModal } from './components/modals/RenameProjectModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  Plus,
  LayoutDashboard,
  Folder,
  Settings,
  Menu,
  X,
  Boxes,
} from 'lucide-react';

type NavView = 'dashboard' | 'projects' | 'detail';

function AppContent() {
  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [projectToExport, setProjectToExport] = useState<Project | null>(null);

  // Load all projects from IndexedDB
  const refreshProjects = useCallback(async () => {
    const list = await getAllProjects();
    setProjects(list);
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentView('detail');
    setIsMobileMenuOpen(false);
  };

  const handleCreateProject = async (name: string, content: string, filename: string, description: string) => {
    try {
      const newProj = await createProjectFromImport(name, content, filename, description);
      // Immediately update projects state to prevent race conditions & blank screen
      setProjects((prev) => [newProj, ...prev.filter((p) => p.id !== newProj.id)]);
      setActiveProjectId(newProj.id);
      setCurrentView('detail');
      showToast(`Project "${newProj.name}" created!`, 'success');
    } catch (err: any) {
      console.error('Error creating project:', err);
      showToast('Failed to create project from file', 'error');
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const copy = await duplicateProject(id);
      if (copy) {
        setProjects((prev) => [copy, ...prev]);
        showToast(`Duplicated as "${copy.name}"`, 'success');
      }
    } catch {
      showToast('Failed to duplicate project', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      if (activeProjectId === projectToDelete.id) {
        setActiveProjectId(null);
        setCurrentView('projects');
      }
      showToast(`Deleted "${projectToDelete.name}"`, 'info');
    } catch {
      showToast('Failed to delete project', 'error');
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleConfirmRename = async (newName: string) => {
    if (!projectToRename) return;
    try {
      const updated = { ...projectToRename, name: newName };
      await saveProject(updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast('Project renamed', 'success');
    } catch {
      showToast('Failed to rename project', 'error');
    } finally {
      setProjectToRename(null);
    }
  };

  const handleUpdateOwned = useCallback(async (materialId: string, newOwned: number) => {
    if (!activeProject) return;

    const newOwnedMap = {
      ...activeProject.ownedMap,
      [materialId]: Math.max(0, newOwned),
    };

    const updated = updateProjectOwnedMap(activeProject, newOwnedMap, activeProject.rawOwnedMap || {});
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await saveProject(updated);
  }, [activeProject]);

  const handleUpdateRawOwned = useCallback(async (itemId: string, newOwned: number) => {
    if (!activeProject) return;

    const newRawOwnedMap = {
      ...(activeProject.rawOwnedMap || {}),
      [itemId]: Math.max(0, newOwned),
    };

    const updated = updateProjectOwnedMap(activeProject, activeProject.ownedMap, newRawOwnedMap);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await saveProject(updated);
  }, [activeProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setIsSettingsModalOpen(false);
        setProjectToDelete(null);
        setProjectToRename(null);
        setProjectToExport(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans text-xs">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => {
                setCurrentView('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="cursor-pointer"
            >
              <Logo size={28} />
            </div>
          </div>

          {/* Top Actions (Clean Light Mode) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              title="Settings & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container (Widescreen up to 1600px) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside
          className={`lg:w-56 shrink-0 lg:block ${
            isMobileMenuOpen ? 'block' : 'hidden'
          } space-y-4`}
        >
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-1">
            <button
              type="button"
              onClick={() => {
                setCurrentView('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('projects');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                currentView === 'projects'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-slate-500" />
                <span>Projects</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-500">
                {projects.length}
              </span>
            </button>
          </div>

          {/* Quick Active Builds in Sidebar */}
          {projects.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                Active Builds
              </span>
              <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                {projects.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleOpenProject(p.id)}
                    className={`w-full px-2.5 py-2 rounded-lg text-left truncate transition flex items-center justify-between cursor-pointer ${
                      activeProjectId === p.id && currentView === 'detail'
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                      {p.progress.percentage}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Center Main View Router */}
        <main className="flex-1 w-full min-w-0">
          <ErrorBoundary fallbackTitle="Could not load project view" onReset={() => setCurrentView('dashboard')}>
            {currentView === 'dashboard' && (
              <Dashboard
                projects={projects}
                onOpenProject={handleOpenProject}
                onNewProject={() => setIsCreateModalOpen(true)}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsList
                projects={projects}
                onOpenProject={handleOpenProject}
                onNewProject={() => setIsCreateModalOpen(true)}
                onDuplicateProject={handleDuplicateProject}
                onRenameProject={setProjectToRename}
                onDeleteProject={setProjectToDelete}
                onExportProject={setProjectToExport}
              />
            )}

            {currentView === 'detail' && (
              activeProject ? (
                <ProjectDetail
                  project={activeProject}
                  onBack={() => setCurrentView('projects')}
                  onUpdateOwned={handleUpdateOwned}
                  onUpdateRawOwned={handleUpdateRawOwned}
                  onRename={() => setProjectToRename(activeProject)}
                  onDuplicate={() => handleDuplicateProject(activeProject.id)}
                  onDelete={() => setProjectToDelete(activeProject)}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">Project Not Found</h3>
                  <p className="text-xs text-slate-500">The selected build project could not be found or is loading.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('projects')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                  >
                    Back to Projects
                  </button>
                </div>
              )
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 text-center text-slate-400 text-xs">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>LitePlan · Minecraft Build Material Planner</span>
          <span>Offline Ready · IndexedDB Local Storage</span>
        </div>
      </footer>

      {/* Global Modals */}
      <ErrorBoundary fallbackTitle="Modal Error">
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />

        <DeleteConfirmModal
          isOpen={!!projectToDelete}
          projectName={projectToDelete?.name || ''}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleConfirmDelete}
        />

        <RenameProjectModal
          isOpen={!!projectToRename}
          currentName={projectToRename?.name || ''}
          onClose={() => setProjectToRename(null)}
          onRename={handleConfirmRename}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onDataChanged={refreshProjects}
        />

        {projectToExport && (
          <ExportModal
            isOpen={!!projectToExport}
            onClose={() => setProjectToExport(null)}
            materials={projectToExport.materials}
            rawMaterials={projectToExport.rawMaterials}
            craftingSteps={projectToExport.craftingSteps}
            projectName={projectToExport.name}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary fallbackTitle="LitePlan Application Error">
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
