import { Project, AppSettings, LitePlanBackup } from '../../types/project';
import { calculateProjectProgress } from '../calculations/progressCalculator';
import { aggregateMaterials } from '../calculations/materialAggregator';
import { calculateRawMaterials } from '../calculations/rawMaterialCalculator';
import { generateCraftingList } from '../calculations/recipeCalculator';
import { parseLitematicaFile } from '../parser';

const DB_NAME = 'LitePlanDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'es',
  autoSave: true,
  defaultStackSize: 64,
};

/**
 * Initializes and returns an IndexedDB database instance.
 * Rejects gracefully when run in non-browser environments.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-Memory & LocalStorage fallback for non-IndexedDB contexts or test environments
const LOCAL_STORAGE_KEY_PROJECTS = 'liteplan_projects_fallback';
const LOCAL_STORAGE_KEY_SETTINGS = 'liteplan_settings_fallback';

let inMemoryProjects: Project[] = [];
let inMemorySettings: AppSettings = DEFAULT_SETTINGS;

/**
 * Validates and repairs project objects from older database schemas.
 * Ensures all required arrays, progress metrics, and calculated summaries are populated.
 */
function migrateProject(p: any): Project {
  const materials = Array.isArray(p.materials) ? p.materials : [];
  const rawMaterials = Array.isArray(p.rawMaterials) ? p.rawMaterials : calculateRawMaterials(materials);
  const craftingSteps = Array.isArray(p.craftingSteps) ? p.craftingSteps : generateCraftingList(materials);
  const craftingCompletedMap = p.craftingCompletedMap || {};

  const progress = p.progress && typeof p.progress.percentage === 'number'
    ? p.progress
    : calculateProjectProgress(materials, craftingSteps, craftingCompletedMap);

  const totalBlocks = progress.totalBlocks || materials.reduce((acc: number, m: any) => acc + (m.totalRequired || 0), 0);
  const totalOwned = progress.ownedBlocks || materials.reduce((acc: number, m: any) => acc + (m.owned || 0), 0);
  const totalMissing = progress.missingBlocks || Math.max(0, totalBlocks - totalOwned);

  const summary = p.summary && typeof p.summary.totalBlocks === 'number'
    ? p.summary
    : {
        totalUniqueMaterials: materials.length,
        totalBlocks,
        totalMissing,
        totalOwned,
        totalAvailable: totalOwned,
        craftableCount: materials.filter((m: any) => m.craftable).length,
        rawMaterialCount: rawMaterials.length,
        totalStacks: Math.ceil(totalBlocks / 64),
        totalCraftingOperations: craftingSteps.reduce((acc: number, s: any) => acc + (s.craftsNeeded || 0), 0),
        uniqueRecipesCount: craftingSteps.length,
        equivalentStorageFormatted: `${Math.ceil(totalBlocks / (27 * 64))} Shulkers`,
        shulkerStorageFormatted: `${Math.ceil(totalBlocks / (27 * 64))} Shulkers`,
        doubleChestStorageFormatted: `${Math.ceil(totalBlocks / (54 * 64))} Double Chests`,
        shulkersRequired: Math.ceil(totalBlocks / (27 * 64)),
        doubleChestsRequired: Math.ceil(totalBlocks / (54 * 64)),
      };

  return {
    ...p,
    name: p.name || 'Untitled Build',
    description: p.description || '',
    thumbnail: p.thumbnail || (materials[0]?.id || 'minecraft:stone'),
    sourceFilename: p.sourceFilename || 'materials.csv',
    sourceFormat: p.sourceFormat || 'csv',
    rawRowCount: p.rawRowCount || materials.length,
    parsedRows: Array.isArray(p.parsedRows) ? p.parsedRows : [],
    materials,
    unrecognized: Array.isArray(p.unrecognized) ? p.unrecognized : [],
    rawMaterials,
    craftingSteps,
    ownedMap: p.ownedMap || {},
    rawOwnedMap: p.rawOwnedMap || {},
    gatheringCompletedMap: p.gatheringCompletedMap || {},
    craftingCompletedMap,
    summary,
    progress,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

/**
 * Retrieves projects from fallback LocalStorage.
 */
function getLocalProjects(): Project[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      const parsed = raw ? JSON.parse(raw) : inMemoryProjects;
      return parsed.map(migrateProject);
    } catch {
      return inMemoryProjects.map(migrateProject);
    }
  }
  return inMemoryProjects.map(migrateProject);
}

/**
 * Persists projects to fallback LocalStorage.
 */
function saveLocalProjects(projects: Project[]) {
  inMemoryProjects = [...projects];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
  }
}

/**
 * Retrieves all stored projects, sorted by updatedAt descending.
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const rawProjects = (request.result as any[]) || [];
        const projects = rawProjects.map(migrateProject);
        projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(projects);
      };

      request.onerror = () => {
        const fallback = getLocalProjects();
        fallback.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(fallback);
      };
    });
  } catch {
    const fallback = getLocalProjects();
    fallback.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return fallback;
  }
}

/**
 * Retrieves a single project by ID.
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.get(id);

      request.onsuccess = () => {
        const res = request.result;
        resolve(res ? migrateProject(res) : null);
      };

      request.onerror = () => {
        resolve(getLocalProjects().find((p) => p.id === id) || null);
      };
    });
  } catch {
    return getLocalProjects().find((p) => p.id === id) || null;
  }
}

/**
 * Saves or updates a project in the database and recalculates progress metrics.
 */
export async function saveProject(project: Project): Promise<Project> {
  const cleanProject = migrateProject(project);
  const updatedProject: Project = {
    ...cleanProject,
    updatedAt: new Date().toISOString(),
    progress: calculateProjectProgress(
      cleanProject.materials,
      cleanProject.craftingSteps,
      cleanProject.craftingCompletedMap || {}
    ),
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.put(updatedProject);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const projects = getLocalProjects();
    const idx = projects.findIndex((p) => p.id === updatedProject.id);
    if (idx >= 0) {
      projects[idx] = updatedProject;
    } else {
      projects.push(updatedProject);
    }
    saveLocalProjects(projects);
  }

  return updatedProject;
}

/**
 * Creates and persists a new project from raw Litematica file content.
 */
export async function createProjectFromImport(
  name: string,
  content: string,
  filename: string,
  description: string = '',
  thumbnail?: string
): Promise<Project> {
  const parsed = parseLitematicaFile(content, filename);
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  // Populate initial owned mapping from file availability column
  const initialOwned: Record<string, number> = {};
  for (const m of parsed.materials) {
    if (m.available > 0) {
      initialOwned[m.id] = m.available;
    }
  }

  const progress = calculateProjectProgress(parsed.materials, parsed.craftingSteps);

  const newProject: Project = {
    id,
    name: name.trim() || filename.replace(/\.[^/.]+$/, ''),
    description: description.trim(),
    createdAt: now,
    updatedAt: now,
    sourceFilename: filename,
    sourceFormat: parsed.format,
    rawRowCount: parsed.rawRowCount,
    parsedRows: parsed.parsedRows,
    materials: parsed.materials,
    unrecognized: parsed.unrecognized,
    rawMaterials: parsed.rawMaterials,
    craftingSteps: parsed.craftingSteps,
    ownedMap: initialOwned,
    rawOwnedMap: {},
    gatheringCompletedMap: {},
    craftingCompletedMap: {},
    summary: parsed.summary,
    progress,
    thumbnail: thumbnail || (parsed.materials[0]?.id || 'minecraft:stone'),
  };

  return await saveProject(newProject);
}

/**
 * Duplicates an existing project.
 */
export async function duplicateProject(id: string): Promise<Project | null> {
  const original = await getProjectById(id);
  if (!original) return null;

  const now = new Date().toISOString();
  const newId = `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const duplicate: Project = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    ownedMap: { ...original.ownedMap },
    rawOwnedMap: { ...(original.rawOwnedMap || {}) },
    gatheringCompletedMap: { ...(original.gatheringCompletedMap || {}) },
    craftingCompletedMap: { ...(original.craftingCompletedMap || {}) },
  };

  return await saveProject(duplicate);
}

/**
 * Deletes a project by ID from IndexedDB and fallback storage.
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const projects = getLocalProjects().filter((p) => p.id !== id);
    saveLocalProjects(projects);
  }
  return true;
}

/**
 * Updates owned quantities and recalculates all material, raw resource, and crafting metrics.
 */
export function updateProjectOwnedMap(
  project: Project,
  newOwnedMap: Record<string, number>,
  newRawOwnedMap: Record<string, number> = project.rawOwnedMap || {}
): Project {
  const { materials, summary } = aggregateMaterials(project.parsedRows, newOwnedMap);
  const rawMaterials = calculateRawMaterials(materials, newRawOwnedMap);
  const craftingSteps = generateCraftingList(materials, newRawOwnedMap);

  summary.rawMaterialCount = rawMaterials.length;

  const progress = calculateProjectProgress(
    materials,
    craftingSteps,
    project.craftingCompletedMap || {}
  );

  return {
    ...project,
    materials,
    rawMaterials,
    craftingSteps,
    ownedMap: newOwnedMap,
    rawOwnedMap: newRawOwnedMap,
    summary,
    progress,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Exports complete backup of LitePlan data as a JSON string.
 */
export async function exportLitePlanBackup(): Promise<string> {
  const projects = await getAllProjects();
  const settings = await getSettings();

  const backup: LitePlanBackup = {
    version: '2.6.0',
    exportedAt: new Date().toISOString(),
    projects,
    settings,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Restores LitePlan data from a backup JSON string.
 */
export async function importLitePlanBackup(jsonString: string): Promise<{ success: boolean; importedCount: number; error?: string }> {
  try {
    const data = JSON.parse(jsonString) as LitePlanBackup;
    if (!data.projects || !Array.isArray(data.projects)) {
      return { success: false, importedCount: 0, error: 'Invalid backup format: missing projects array' };
    }

    let count = 0;
    for (const proj of data.projects) {
      if (proj && proj.id && proj.name) {
        await saveProject(migrateProject(proj));
        count++;
      }
    }

    if (data.settings) {
      await saveSettings(data.settings);
    }

    return { success: true, importedCount: count };
  } catch (err: any) {
    return { success: false, importedCount: 0, error: err.message || 'Error parsing JSON backup' };
  }
}

/**
 * Deletes all projects and resets settings.
 */
export async function clearAllData(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_PROJECTS, STORE_SETTINGS], 'readwrite');
      tx.objectStore(STORE_PROJECTS).clear();
      tx.objectStore(STORE_SETTINGS).clear();
      tx.oncomplete = () => resolve();
    });
  } catch {
    // ignore
  }

  inMemoryProjects = [];
  inMemorySettings = DEFAULT_SETTINGS;

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS);
  }
}

/**
 * Retrieves application settings from storage.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.get('app_settings');

      request.onsuccess = () => {
        const val = request.result?.value;
        resolve(val ? { ...DEFAULT_SETTINGS, ...val } : DEFAULT_SETTINGS);
      };
      request.onerror = () => {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
          resolve(raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : inMemorySettings);
        } else {
          resolve(inMemorySettings);
        }
      };
    });
  } catch {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : inMemorySettings;
    }
    return inMemorySettings;
  }
}

/**
 * Persists application settings to storage.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  inMemorySettings = { ...settings };
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.put({ key: 'app_settings', value: settings });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }
  }
}
