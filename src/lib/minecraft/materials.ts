import { MATERIALS_DATABASE } from '../../data/materialsDatabase';
import { MaterialDefinition } from '../../types/material';

export function getMaterialDefinition(idOrMinecraftId: string): MaterialDefinition | undefined {
  return MATERIALS_DATABASE[idOrMinecraftId];
}

export function getAllMaterials(): MaterialDefinition[] {
  return Object.values(MATERIALS_DATABASE);
}
