import { describe, it, expect } from 'vitest';
import { parseCSV } from '../lib/parser/csvParser';
import { parseAsciiTable } from '../lib/parser/txtParser';
import { parseLitematicaFile } from '../lib/parser';
import { normalizeMaterial } from '../lib/parser/materialNormalizer';
import { SAMPLE_NETHER_PORTAL_TXT, SAMPLE_NETHER_PORTAL_CSV, SAMPLE_REDSTONE_FACTORY_CSV } from '../data/sampleData';

describe('Litematica Parsers & Material Normalization Test Suite', () => {
  describe('CSV Parser', () => {
    it('parses standard CSV export with Spanish headers and names', () => {
      const rows = parseCSV(SAMPLE_NETHER_PORTAL_CSV);
      expect(rows.length).toBeGreaterThan(10);
      
      const diorita = rows.find((r) => r.rawName === 'Diorita pulida');
      expect(diorita).toBeDefined();
      expect(diorita?.total).toBe(5591);
      expect(diorita?.missing).toBe(5591);
      expect(diorita?.available).toBe(0);
    });

    it('parses English CSV export with redstone components', () => {
      const rows = parseCSV(SAMPLE_REDSTONE_FACTORY_CSV);
      expect(rows.length).toBe(9);
      
      const piston = rows.find((r) => r.rawName === 'Piston');
      expect(piston?.total).toBe(32);
    });

    it('handles empty or malformed CSV content safely without crashing', () => {
      const emptyRows = parseCSV('');
      expect(emptyRows.length).toBe(0);

      const invalidRows = parseCSV('This is just random text with no commas');
      expect(invalidRows.length).toBe(0);
    });
  });

  describe('TXT Parser', () => {
    it('parses formatted Litematica ASCII table TXT export', () => {
      const rows = parseAsciiTable(SAMPLE_NETHER_PORTAL_TXT);
      expect(rows.length).toBeGreaterThan(10);

      const piedraLisa = rows.find((r) => r.rawName.toLowerCase().includes('piedra lisa'));
      expect(piedraLisa).toBeDefined();
      expect(piedraLisa?.total).toBe(4577);
    });

    it('handles corrupted TXT lines gracefully', () => {
      const brokenTXT = `+-------+-------+
| Item | Total |
+-------+-------+
| Stone | not_a_number |
+-------+-------+`;
      const rows = parseAsciiTable(brokenTXT);
      expect(rows.length).toBe(0);
    });
  });

  describe('Material Normalizer', () => {
    it('normalizes Spanish and English names to valid Minecraft item IDs', () => {
      const stoneEs = normalizeMaterial('Piedra');
      expect(stoneEs.material.id).toBe('minecraft:stone');

      const stoneEn = normalizeMaterial('Stone');
      expect(stoneEn.material.id).toBe('minecraft:stone');

      const oakPlanks = normalizeMaterial('Tablas de roble');
      expect(oakPlanks.material.id).toBe('minecraft:oak_planks');

      const repeater = normalizeMaterial('Repetidor de redstone');
      expect(repeater.material.id).toBe('minecraft:repeater');
    });

    it('falls back safely for unknown custom or modded block names', () => {
      const unknown = normalizeMaterial('super_custom_mod_block');
      expect(unknown.isRecognized).toBe(false);
      expect(unknown.material.id).toBe('minecraft:super_custom_mod_block');
      expect(unknown.material.category).toBe('misc');
    });
  });

  describe('Full Litematica File Parser Pipeline', () => {
    it('generates a complete BuildSummary and analyzed materials for a file', () => {
      const parsed = parseLitematicaFile(SAMPLE_NETHER_PORTAL_CSV, 'portal.csv');
      expect(parsed.format).toBe('csv');
      expect(parsed.summary.totalBlocks).toBeGreaterThan(10000);
      expect(parsed.materials.length).toBeGreaterThan(10);
      expect(parsed.rawMaterials.length).toBeGreaterThan(0);
      expect(parsed.summary.shulkersRequired).toBeGreaterThan(0);
    });
  });
});
