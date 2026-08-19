import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { MaterialDefinition } from '../../types/material';

export function resolveItemDefinition(itemId: string): MaterialDefinition | null {
  const normalizedId = itemId.startsWith('minecraft:') ? itemId : `minecraft:${itemId}`;
  return MATERIALS_DATABASE[normalizedId] || null;
}

export function getItemDisplayName(itemId: string, lang: 'es' | 'en' = 'es'): string {
  const def = resolveItemDefinition(itemId);
  if (!def) {
    return itemId.replace('minecraft:', '').replace(/_/g, ' ');
  }
  return lang === 'en' ? def.displayNameEn : def.displayNameEs;
}
