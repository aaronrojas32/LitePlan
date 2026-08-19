import { AnalyzedMaterial } from '../../types/material';
import { RawMaterialRequirement, CraftingStep } from '../../types/recipe';
import { ExportOptions } from '../../types/export';

export function exportToTXT(
  materials: AnalyzedMaterial[],
  rawMaterials: RawMaterialRequirement[],
  craftingSteps: CraftingStep[],
  options: ExportOptions
): string {
  const lang = options.language || 'es';
  const timestamp = new Date().toLocaleDateString();

  if (options.type === 'raw_materials') {
    const lines = [
      `==================================================`,
      `LITEPLAN - RAW MATERIALS TO GATHER`,
      `Date: ${timestamp}`,
      `Total raw items: ${rawMaterials.reduce((acc, r) => acc + r.quantity, 0).toLocaleString()}`,
      `==================================================`,
      ``,
    ];

    for (const item of rawMaterials) {
      lines.push(`${item.displayName.padEnd(32)} | ${item.quantity.toString().padStart(6)} | ${item.stacks.padEnd(16)} | ${item.storage}`);
      if (item.source) {
        lines.push(`  Source: ${item.source}`);
      }
    }
    return lines.join('\n');
  }

  if (options.type === 'crafting_list') {
    const lines = [
      `==================================================`,
      `LITEPLAN - CRAFTING OPERATIONS LIST`,
      `Date: ${timestamp}`,
      `Total crafting operations: ${craftingSteps.reduce((acc, s) => acc + s.craftsNeeded, 0)}`,
      `==================================================`,
      ``,
    ];

    for (const step of craftingSteps) {
      lines.push(`CRAFT: ${step.outputQuantity}x ${step.outputName} (${step.craftsNeeded} crafts${step.extraQuantity > 0 ? `, +${step.extraQuantity} extra` : ''})`);
      lines.push(`  Ingredients:`);
      for (const ing of step.ingredients) {
        lines.push(`    - ${ing.quantity}x ${ing.displayName} (${ing.stacks})`);
      }
      lines.push(`--------------------------------------------------`);
    }
    return lines.join('\n');
  }

  if (options.type === 'storage_list') {
    const lines = [
      `==================================================`,
      `LITEPLAN - STORAGE PREPARATION LIST`,
      `Date: ${timestamp}`,
      `==================================================`,
      ``,
    ];

    for (const item of materials) {
      const name = lang === 'en' ? item.displayNameEn : item.displayNameEs;
      lines.push(`${(name || item.displayName).toUpperCase()}`);
      lines.push(`  Quantity: ${item.totalRequired.toLocaleString()}`);
      lines.push(`  Stacks:   ${item.stacksRequired.formatted}`);
      lines.push(`  Shulker:  ${item.storage.shulkerStorageFormatted}`);
      lines.push(`  Chests:   ${item.storage.doubleChestStorageFormatted}`);
      lines.push(`  Boxes:    ${item.storage.shulkersRequired} Shulker(s) / ${item.storage.doubleChestsRequired} Double Chest(s) needed`);
      lines.push(`--------------------------------------------------`);
    }
    return lines.join('\n');
  }

  let filtered = materials;
  if (options.type === 'missing') {
    filtered = materials.filter(m => m.missing > 0);
  } else if (options.type === 'craftable') {
    filtered = materials.filter(m => m.craftable);
  }

  const lines = [
    `==================================================`,
    `LITEPLAN - MATERIAL LIST (${options.type.toUpperCase()})`,
    `Date: ${timestamp}`,
    `Total Materials: ${filtered.length}`,
    `Total Blocks: ${filtered.reduce((acc, m) => acc + m.totalRequired, 0).toLocaleString()}`,
    `==================================================`,
    ``,
    `${'Material'.padEnd(28)} | ${'Required'.padStart(8)} | ${'Owned'.padStart(8)} | ${'Missing'.padStart(8)} | Stacks`,
    `----------------------------------------------------------------------------------------`,
  ];

  for (const item of filtered) {
    const name = lang === 'en' ? item.displayNameEn : item.displayNameEs;
    lines.push(
      `${(name || item.displayName).padEnd(28)} | ${item.totalRequired.toString().padStart(8)} | ${item.owned.toString().padStart(8)} | ${item.missing.toString().padStart(8)} | ${item.stacksRequired.formatted}`
    );
  }

  return lines.join('\n');
}
