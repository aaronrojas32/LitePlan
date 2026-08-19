import { AnalyzedMaterial } from '../../types/material';
import { RawMaterialRequirement, CraftingStep } from '../../types/recipe';
import { ExportOptions } from '../../types/export';

export function exportToCSV(
  materials: AnalyzedMaterial[],
  rawMaterials: RawMaterialRequirement[],
  craftingSteps: CraftingStep[],
  options: ExportOptions
): string {
  const lang = options.language || 'es';

  if (options.type === 'raw_materials') {
    const headers = ['"Material"', '"Minecraft ID"', '"Quantity"', '"Stacks"', '"Storage"', '"Source"'];
    const rows = rawMaterials.map(r => [
      `"${r.displayName.replace(/"/g, '""')}"`,
      `"${r.minecraftId}"`,
      r.quantity,
      `"${r.stacks}"`,
      `"${r.storage}"`,
      `"${(r.source || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  if (options.type === 'crafting_list') {
    const headers = ['"Output Item"', '"Quantity Needed"', '"Crafts Required"', '"Produced"', '"Extra/Surplus"', '"Ingredients"'];
    const rows = craftingSteps.map(s => {
      const ingText = s.ingredients.map(i => `${i.quantity}x ${i.displayName}`).join('; ');
      return [
        `"${s.outputName.replace(/"/g, '""')}"`,
        s.outputQuantity,
        s.craftsNeeded,
        s.producedQuantity,
        s.extraQuantity,
        `"${ingText.replace(/"/g, '""')}"`,
      ];
    });
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  if (options.type === 'storage_list') {
    const headers = ['"Material"', '"Minecraft ID"', '"Quantity"', '"Stacks"', '"Shulker Storage"', '"Double Chest Storage"', '"Shulkers Required"', '"Double Chests Required"'];
    const rows = materials.map(m => {
      const name = lang === 'en' ? m.displayNameEn : m.displayNameEs;
      return [
        `"${(name || m.displayName).replace(/"/g, '""')}"`,
        `"${m.minecraftId}"`,
        m.totalRequired,
        `"${m.stacksRequired.formatted}"`,
        `"${m.storage.shulkerStorageFormatted}"`,
        `"${m.storage.doubleChestStorageFormatted}"`,
        m.storage.shulkersRequired,
        m.storage.doubleChestsRequired,
      ];
    });
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  let filtered = materials;
  if (options.type === 'missing') {
    filtered = materials.filter(m => m.missing > 0);
  } else if (options.type === 'craftable') {
    filtered = materials.filter(m => m.craftable);
  }

  const headers = ['"Material"', '"Minecraft ID"', '"Required"', '"Owned"', '"Missing"', '"Stacks Required"', '"Storage"', '"Craftable"'];
  const rows = filtered.map(m => {
    const name = lang === 'en' ? m.displayNameEn : m.displayNameEs;
    return [
      `"${(name || m.displayName).replace(/"/g, '""')}"`,
      `"${m.minecraftId}"`,
      m.totalRequired,
      m.owned,
      m.missing,
      `"${m.stacksRequired.formatted}"`,
      `"${m.storage.shulkerStorageFormatted}"`,
      m.craftable ? '"Yes"' : '"No"',
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function triggerDownload(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
