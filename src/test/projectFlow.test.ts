import { describe, it, expect } from 'vitest';
import { createProjectFromImport, updateProjectOwnedMap } from '../lib/storage/projectStore';
import { SAMPLE_NETHER_PORTAL_TXT, SAMPLE_REDSTONE_FACTORY_CSV } from '../data/sampleData';
import { parseLitematicaFile } from '../lib/parser';

describe('Project Creation Flow & Data Integrity Suite', () => {
  it('creates project from Nether Portal TXT and generates full valid object tree', async () => {
    const project = await createProjectFromImport(
      'Nether Portal Test',
      SAMPLE_NETHER_PORTAL_TXT,
      'portal.txt',
      'Testing description'
    );

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Nether Portal Test');
    expect(project.materials.length).toBeGreaterThan(10);
    expect(project.summary.totalBlocks).toBeGreaterThan(10000);
    expect(project.progress.totalBlocks).toBe(project.summary.totalBlocks);
    expect(project.progress.ownedBlocks).toBe(0);
    expect(project.progress.percentage).toBe(0);
    expect(project.progress.completedMaterials).toBe(0);
    expect(project.rawMaterials.length).toBeGreaterThan(0);
    expect(project.craftingSteps.length).toBeGreaterThan(0);
    expect(project.ownedMap).toBeDefined();
    expect(project.rawOwnedMap).toBeDefined();
  });

  it('creates project from CSV and validates all fields expected by ProjectDetail', async () => {
    const project = await createProjectFromImport(
      'Redstone Project',
      SAMPLE_REDSTONE_FACTORY_CSV,
      'factory.csv',
      'Redstone notes'
    );

    // Validate fields accessed in ProjectDetail
    expect(project.name).toBe('Redstone Project');
    expect(project.thumbnail).toBeDefined();
    expect(project.summary.totalBlocks).toBeGreaterThan(0);
    expect(project.summary.totalUniqueMaterials).toBe(project.materials.length);
    expect(project.progress.percentage).toBeDefined();
    expect(project.progress.ownedBlocks).toBeDefined();
    expect(project.progress.totalBlocks).toBeDefined();
    expect(project.progress.completedMaterials).toBeDefined();
    expect(project.progress.totalMaterials).toBeDefined();

    // Validate materials table fields
    for (const mat of project.materials) {
      expect(mat.id).toBeDefined();
      expect(mat.displayName).toBeDefined();
      expect(mat.totalRequired).toBeGreaterThan(0);
      expect(mat.owned).toBeDefined();
      expect(mat.missing).toBeDefined();
      expect(mat.quantity).toBeDefined();
      expect(mat.quantity.stacksFormatted).toBeDefined();
      expect(mat.storage).toBeDefined();
      expect(mat.storage.shulkerStorageFormatted).toBeDefined();
    }
  });

  it('supports updating owned quantities in memory without data corruption', () => {
    const parsed = parseLitematicaFile(SAMPLE_REDSTONE_FACTORY_CSV, 'factory.csv');
    const dummyProject = {
      id: 'proj_test',
      name: 'Test',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceFilename: 'factory.csv',
      sourceFormat: parsed.format,
      rawRowCount: parsed.rawRowCount,
      parsedRows: parsed.parsedRows,
      materials: parsed.materials,
      unrecognized: parsed.unrecognized,
      rawMaterials: parsed.rawMaterials,
      craftingSteps: parsed.craftingSteps,
      ownedMap: {},
      rawOwnedMap: {},
      summary: parsed.summary,
      progress: {
        totalBlocks: parsed.summary.totalBlocks,
        ownedBlocks: 0,
        missingBlocks: parsed.summary.totalBlocks,
        percentage: 0,
        totalMaterials: parsed.materials.length,
        completedMaterials: 0,
        totalCraftingOps: parsed.summary.totalCraftingOperations,
        completedCraftingOps: 0,
        isComplete: false,
      },
    };

    const firstMat = dummyProject.materials[0];
    const updated = updateProjectOwnedMap(
      dummyProject as any,
      { [firstMat.id]: firstMat.totalRequired },
      {}
    );

    const target = updated.materials.find((m) => m.id === firstMat.id);
    expect(target?.missing).toBe(0);
    expect(target?.owned).toBe(firstMat.totalRequired);
  });
});
