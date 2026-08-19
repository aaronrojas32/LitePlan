import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { ALIAS_MAP } from '../../data/aliasMap';
import { MaterialDefinition } from '../../types/material';

/**
 * Strips accents/diacritics and lowercases the input string
 */
export function cleanString(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/["'_]/g, ' ') // replace quotes and underscores with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempts to normalize any raw material name (English, Spanish, Minecraft ID)
 * into a known MaterialDefinition or a generated fallback definition.
 */
export function normalizeMaterial(rawName: string): {
  material: MaterialDefinition;
  isRecognized: boolean;
} {
  const trimmed = rawName.trim();
  const cleaned = cleanString(trimmed);

  // 1. Direct match on official ID (e.g. "minecraft:polished_diorite")
  if (MATERIALS_DATABASE[trimmed]) {
    return { material: MATERIALS_DATABASE[trimmed], isRecognized: true };
  }

  const prefixed = trimmed.startsWith('minecraft:') ? trimmed : `minecraft:${trimmed.toLowerCase().replace(/\s+/g, '_')}`;
  if (MATERIALS_DATABASE[prefixed]) {
    return { material: MATERIALS_DATABASE[prefixed], isRecognized: true };
  }

  // 2. Direct match on ALIAS_MAP
  if (ALIAS_MAP[cleaned]) {
    const targetId = ALIAS_MAP[cleaned];
    if (MATERIALS_DATABASE[targetId]) {
      return { material: MATERIALS_DATABASE[targetId], isRecognized: true };
    }
  }

  // 3. Search by English or Spanish display names in MATERIALS_DATABASE
  for (const mat of Object.values(MATERIALS_DATABASE)) {
    const enCleaned = cleanString(mat.displayNameEn);
    const esCleaned = cleanString(mat.displayNameEs);
    const idCleaned = cleanString(mat.id.replace('minecraft:', ''));

    if (cleaned === enCleaned || cleaned === esCleaned || cleaned === idCleaned) {
      return { material: mat, isRecognized: true };
    }
  }

  // 4. Substring or fuzzy alias check
  for (const [alias, targetId] of Object.entries(ALIAS_MAP)) {
    if (cleaned === alias || cleaned.includes(alias) || alias.includes(cleaned)) {
      if (MATERIALS_DATABASE[targetId]) {
        return { material: MATERIALS_DATABASE[targetId], isRecognized: true };
      }
    }
  }

  // 5. Fallback for unrecognized items (Preserve data!)
  const fallbackId = `minecraft:${cleaned.replace(/\s+/g, '_') || 'unknown_item'}`;
  const fallbackMaterial: MaterialDefinition = {
    id: fallbackId,
    minecraftId: fallbackId,
    displayNameEn: trimmed,
    displayNameEs: trimmed,
    stackSize: 64,
    category: 'misc',
    craftable: false,
    isRaw: true,
    source: 'Recolectar en el mundo',
    iconEmoji: '❓',
  };

  return { material: fallbackMaterial, isRecognized: false };
}
