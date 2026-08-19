/**
 * Item Icon Resolver for Minecraft textures.
 * Uses local extracted PNG textures from `public/assets/minecraft/*.png`
 * with automatic alias normalization, fallback CDN, and error tracking.
 */

// Common ID aliases to match Minecraft texture filenames
const ITEM_ALIAS_MAP: Record<string, string> = {
  'minecraft:oak_planks': 'oak_planks',
  'minecraft:oak_log': 'oak_log',
  'minecraft:stone': 'stone',
  'minecraft:cobblestone': 'cobblestone',
  'minecraft:diorite': 'diorite',
  'minecraft:polished_diorite': 'polished_diorite',
  'minecraft:smooth_stone': 'smooth_stone',
  'minecraft:iron_ingot': 'iron_ingot',
  'minecraft:gold_ingot': 'gold_ingot',
  'minecraft:diamond': 'diamond',
  'minecraft:redstone': 'redstone',
  'minecraft:redstone_dust': 'redstone',
  'minecraft:piston': 'piston',
  'minecraft:sticky_piston': 'sticky_piston',
  'minecraft:repeater': 'repeater',
  'minecraft:comparator': 'comparator',
  'minecraft:dispenser': 'dispenser',
  'minecraft:dropper': 'dropper',
  'minecraft:observer': 'observer',
  'minecraft:hopper': 'hopper',
  'minecraft:stick': 'stick',
  'minecraft:crafting_table': 'crafting_table',
  'minecraft:chest': 'chest',
  'minecraft:trapped_chest': 'trapped_chest',
  'minecraft:barrel': 'barrel',
  'minecraft:shulker_box': 'shulker_box',
  'minecraft:ender_chest': 'ender_chest',
  'minecraft:glass': 'glass',
  'minecraft:tinted_glass': 'tinted_glass',
  'minecraft:sea_lantern': 'sea_lantern',
  'minecraft:glowstone': 'glowstone',
  'minecraft:lantern': 'lantern',
  'minecraft:soul_lantern': 'soul_lantern',
  'minecraft:torch': 'torch',
  'minecraft:soul_torch': 'soul_torch',
  'minecraft:redstone_torch': 'redstone_torch',
  'minecraft:end_rod': 'end_rod',
  'minecraft:crying_obsidian': 'crying_obsidian',
  'minecraft:obsidian': 'obsidian',
  'minecraft:netherrack': 'netherrack',
  'minecraft:nether_bricks': 'nether_bricks',
  'minecraft:red_nether_bricks': 'red_nether_bricks',
  'minecraft:quartz_block': 'quartz_block',
  'minecraft:smooth_quartz': 'smooth_quartz',
  'minecraft:chiseled_quartz_block': 'chiseled_quartz_block',
  'minecraft:quartz_pillar': 'quartz_pillar',
  'minecraft:quartz_bricks': 'quartz_bricks',
  'minecraft:prismarine': 'prismarine',
  'minecraft:prismarine_bricks': 'prismarine_bricks',
  'minecraft:dark_prismarine': 'dark_prismarine',
  'minecraft:slime_block': 'slime_block',
  'minecraft:honey_block': 'honey_block',
  'minecraft:furnace': 'furnace',
  'minecraft:blast_furnace': 'blast_furnace',
  'minecraft:smoker': 'smoker',
  'minecraft:stonecutter': 'stonecutter',
  'minecraft:anvil': 'anvil',
  'minecraft:grindstone': 'grindstone',
  'minecraft:smithing_table': 'smithing_table',
  'minecraft:iron_pickaxe': 'iron_pickaxe',
  'minecraft:diamond_pickaxe': 'diamond_pickaxe',
  'minecraft:netherite_pickaxe': 'netherite_pickaxe',
};

// In-memory cache for resolved icons to avoid repeated calculations
const ICON_CACHE = new Map<string, string>();
const FAILED_ASSETS = new Set<string>();

/**
 * Returns candidate URLs for an item ID.
 * Priority:
 * 1. Local extracted PNG asset: `/assets/minecraft/${name}.png`
 * 2. PrismarineJS 1.20.4 CDN asset
 * 3. Minecraft Wiki assets
 */
export function getItemIconCandidates(itemId: string): string[] {
  const cleanId = itemId.replace(/^minecraft:/, '').toLowerCase().trim();
  const alias = ITEM_ALIAS_MAP[itemId] || ITEM_ALIAS_MAP[`minecraft:${cleanId}`] || cleanId;

  // Base URL from Vite (respects GitHub Pages subpath)
  const baseUrl = import.meta.env.BASE_URL || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Local assets from workspace ZIP extraction
  const localUrl = `${cleanBase}assets/minecraft/${alias}.png`;
  const localDirectUrl = `${cleanBase}assets/minecraft/${cleanId}.png`;

  // Remote CDNs as fallback
  const prismarineUrl = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/pc/1.20.4/items/${alias}.png`;
  const prismarineBlockUrl = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/pc/1.20.4/blocks/${alias}.png`;

  return Array.from(new Set([localUrl, localDirectUrl, prismarineUrl, prismarineBlockUrl]));
}

/**
 * Logs unknown or missing assets to console for debugging
 */
export function recordFailedAsset(itemId: string) {
  if (!FAILED_ASSETS.has(itemId)) {
    FAILED_ASSETS.add(itemId);
    console.warn(`[LitePlan Asset Debug] Unknown asset or missing texture for: "${itemId}"`);
  }
}

export function getFailedAssetsList(): string[] {
  return Array.from(FAILED_ASSETS);
}

export { ICON_CACHE };
