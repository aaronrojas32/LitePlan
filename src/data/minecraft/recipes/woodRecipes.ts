import { Recipe } from './types';

// Helper to generate standard wood items for a wood type
function createWoodFamily(
  woodName: string,
  logId: string,
  plankId: string,
  woodId?: string
): Recipe[] {
  const recipes: Recipe[] = [
    // Log -> 4 Planks
    {
      id: `${plankId}_from_log`,
      type: 'crafting_shapeless',
      output: { itemId: plankId, quantity: 4 },
      ingredients: [{ itemId: logId, quantity: 1 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
      description: `1x ${woodName} Log -> 4x ${woodName} Planks`,
    },
    // 6 Planks -> 4 Stairs
    {
      id: `minecraft:${woodName}_stairs`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, null, null],
        [plankId, plankId, null],
        [plankId, plankId, plankId],
      ],
      output: { itemId: `minecraft:${woodName}_stairs`, quantity: 4 },
      ingredients: [{ itemId: plankId, quantity: 6 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
      description: `6x ${woodName} Planks -> 4x ${woodName} Stairs`,
    },
    // 3 Planks -> 6 Slabs
    {
      id: `minecraft:${woodName}_slab`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, plankId, plankId],
        [null, null, null],
        [null, null, null],
      ],
      output: { itemId: `minecraft:${woodName}_slab`, quantity: 6 },
      ingredients: [{ itemId: plankId, quantity: 3 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
      description: `3x ${woodName} Planks -> 6x ${woodName} Slabs`,
    },
    // 4 Planks + 2 Sticks -> 3 Fences
    {
      id: `minecraft:${woodName}_fence`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, 'minecraft:stick', plankId],
        [plankId, 'minecraft:stick', plankId],
        [null, null, null],
      ],
      output: { itemId: `minecraft:${woodName}_fence`, quantity: 3 },
      ingredients: [
        { itemId: plankId, quantity: 4 },
        { itemId: 'minecraft:stick', quantity: 2 },
      ],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 2 Planks + 4 Sticks -> 1 Fence Gate
    {
      id: `minecraft:${woodName}_fence_gate`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        ['minecraft:stick', plankId, 'minecraft:stick'],
        ['minecraft:stick', plankId, 'minecraft:stick'],
        [null, null, null],
      ],
      output: { itemId: `minecraft:${woodName}_fence_gate`, quantity: 1 },
      ingredients: [
        { itemId: plankId, quantity: 2 },
        { itemId: 'minecraft:stick', quantity: 4 },
      ],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 6 Planks -> 3 Doors
    {
      id: `minecraft:${woodName}_door`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, plankId, null],
        [plankId, plankId, null],
        [plankId, plankId, null],
      ],
      output: { itemId: `minecraft:${woodName}_door`, quantity: 3 },
      ingredients: [{ itemId: plankId, quantity: 6 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 6 Planks -> 2 Trapdoors
    {
      id: `minecraft:${woodName}_trapdoor`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, plankId, plankId],
        [plankId, plankId, plankId],
        [null, null, null],
      ],
      output: { itemId: `minecraft:${woodName}_trapdoor`, quantity: 2 },
      ingredients: [{ itemId: plankId, quantity: 6 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 2 Planks -> 1 Pressure Plate
    {
      id: `minecraft:${woodName}_pressure_plate`,
      type: 'crafting_shaped',
      gridSize: '2x2',
      gridPattern: [
        [plankId, plankId],
        [null, null],
      ],
      output: { itemId: `minecraft:${woodName}_pressure_plate`, quantity: 1 },
      ingredients: [{ itemId: plankId, quantity: 2 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 1 Plank -> 1 Button
    {
      id: `minecraft:${woodName}_button`,
      type: 'crafting_shapeless',
      output: { itemId: `minecraft:${woodName}_button`, quantity: 1 },
      ingredients: [{ itemId: plankId, quantity: 1 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
    // 6 Planks + 1 Stick -> 3 Signs
    {
      id: `minecraft:${woodName}_sign`,
      type: 'crafting_shaped',
      gridSize: '3x3',
      gridPattern: [
        [plankId, plankId, plankId],
        [plankId, plankId, plankId],
        [null, 'minecraft:stick', null],
      ],
      output: { itemId: `minecraft:${woodName}_sign`, quantity: 3 },
      ingredients: [
        { itemId: plankId, quantity: 6 },
        { itemId: 'minecraft:stick', quantity: 1 },
      ],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    },
  ];

  // 4 Logs -> 3 Wood (6-sided bark)
  if (woodId) {
    recipes.push({
      id: `${woodId}_from_logs`,
      type: 'crafting_shaped',
      gridSize: '2x2',
      gridPattern: [
        [logId, logId],
        [logId, logId],
      ],
      output: { itemId: woodId, quantity: 3 },
      ingredients: [{ itemId: logId, quantity: 4 }],
      priority: 100,
      isDefault: true,
      minecraftVersion: '1.21',
    });
  }

  return recipes;
}

export const WOOD_RECIPES: Recipe[] = [
  // General Sticks
  {
    id: 'minecraft:stick',
    type: 'crafting_shaped',
    gridSize: '2x2',
    gridPattern: [
      ['minecraft:oak_planks', null],
      ['minecraft:oak_planks', null],
    ],
    output: { itemId: 'minecraft:stick', quantity: 4 },
    ingredients: [{ itemId: 'minecraft:oak_planks', quantity: 2 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
    description: '2x Wooden Planks -> 4x Sticks',
  },
  // Crafting Table
  {
    id: 'minecraft:crafting_table',
    type: 'crafting_shaped',
    gridSize: '2x2',
    gridPattern: [
      ['minecraft:oak_planks', 'minecraft:oak_planks'],
      ['minecraft:oak_planks', 'minecraft:oak_planks'],
    ],
    output: { itemId: 'minecraft:crafting_table', quantity: 1 },
    ingredients: [{ itemId: 'minecraft:oak_planks', quantity: 4 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  // Chest
  {
    id: 'minecraft:chest',
    type: 'crafting_shaped',
    gridSize: '3x3',
    gridPattern: [
      ['minecraft:oak_planks', 'minecraft:oak_planks', 'minecraft:oak_planks'],
      ['minecraft:oak_planks', null, 'minecraft:oak_planks'],
      ['minecraft:oak_planks', 'minecraft:oak_planks', 'minecraft:oak_planks'],
    ],
    output: { itemId: 'minecraft:chest', quantity: 1 },
    ingredients: [{ itemId: 'minecraft:oak_planks', quantity: 8 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  // Barrel
  {
    id: 'minecraft:barrel',
    type: 'crafting_shaped',
    gridSize: '3x3',
    gridPattern: [
      ['minecraft:oak_planks', 'minecraft:oak_slab', 'minecraft:oak_planks'],
      ['minecraft:oak_planks', null, 'minecraft:oak_planks'],
      ['minecraft:oak_planks', 'minecraft:oak_slab', 'minecraft:oak_planks'],
    ],
    output: { itemId: 'minecraft:barrel', quantity: 1 },
    ingredients: [
      { itemId: 'minecraft:oak_planks', quantity: 6 },
      { itemId: 'minecraft:oak_slab', quantity: 2 },
    ],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  // Bowl
  {
    id: 'minecraft:bowl',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bowl', quantity: 4 },
    ingredients: [{ itemId: 'minecraft:oak_planks', quantity: 3 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  // Ladder
  {
    id: 'minecraft:ladder',
    type: 'crafting_shaped',
    gridSize: '3x3',
    gridPattern: [
      ['minecraft:stick', null, 'minecraft:stick'],
      ['minecraft:stick', 'minecraft:stick', 'minecraft:stick'],
      ['minecraft:stick', null, 'minecraft:stick'],
    ],
    output: { itemId: 'minecraft:ladder', quantity: 3 },
    ingredients: [{ itemId: 'minecraft:stick', quantity: 7 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },

  // Wood families
  ...createWoodFamily('oak', 'minecraft:oak_log', 'minecraft:oak_planks', 'minecraft:oak_wood'),
  ...createWoodFamily('spruce', 'minecraft:spruce_log', 'minecraft:spruce_planks', 'minecraft:spruce_wood'),
  ...createWoodFamily('birch', 'minecraft:birch_log', 'minecraft:birch_planks', 'minecraft:birch_wood'),
  ...createWoodFamily('jungle', 'minecraft:jungle_log', 'minecraft:jungle_planks', 'minecraft:jungle_wood'),
  ...createWoodFamily('acacia', 'minecraft:acacia_log', 'minecraft:acacia_planks', 'minecraft:acacia_wood'),
  ...createWoodFamily('dark_oak', 'minecraft:dark_oak_log', 'minecraft:dark_oak_planks', 'minecraft:dark_oak_wood'),
  ...createWoodFamily('mangrove', 'minecraft:mangrove_log', 'minecraft:mangrove_planks', 'minecraft:mangrove_wood'),
  ...createWoodFamily('cherry', 'minecraft:cherry_log', 'minecraft:cherry_planks', 'minecraft:cherry_wood'),
  ...createWoodFamily('pale_oak', 'minecraft:pale_oak_log', 'minecraft:pale_oak_planks', 'minecraft:pale_oak_wood'),
  ...createWoodFamily('crimson', 'minecraft:crimson_stem', 'minecraft:crimson_planks', 'minecraft:crimson_hyphae'),
  ...createWoodFamily('warped', 'minecraft:warped_stem', 'minecraft:warped_planks', 'minecraft:warped_hyphae'),

  // Bamboo Family (Distinct Mechanics: 9 Bamboo -> 1 Bamboo Block, 1 Bamboo Block -> 2 Bamboo Planks, 6 Planks -> 6 Mosaic)
  {
    id: 'minecraft:bamboo_block',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_block', quantity: 1 },
    ingredients: [{ itemId: 'minecraft:bamboo', quantity: 9 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_planks',
    type: 'crafting_shapeless',
    output: { itemId: 'minecraft:bamboo_planks', quantity: 2 },
    ingredients: [{ itemId: 'minecraft:bamboo_block', quantity: 1 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_mosaic',
    type: 'crafting_shaped',
    gridSize: '2x2',
    output: { itemId: 'minecraft:bamboo_mosaic', quantity: 1 },
    ingredients: [{ itemId: 'minecraft:bamboo_slab', quantity: 2 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_stairs',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_stairs', quantity: 4 },
    ingredients: [{ itemId: 'minecraft:bamboo_planks', quantity: 6 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_slab',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_slab', quantity: 6 },
    ingredients: [{ itemId: 'minecraft:bamboo_planks', quantity: 3 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_fence',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_fence', quantity: 3 },
    ingredients: [
      { itemId: 'minecraft:bamboo_planks', quantity: 4 },
      { itemId: 'minecraft:stick', quantity: 2 },
    ],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_fence_gate',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_fence_gate', quantity: 1 },
    ingredients: [
      { itemId: 'minecraft:bamboo_planks', quantity: 2 },
      { itemId: 'minecraft:stick', quantity: 4 },
    ],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_door',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_door', quantity: 3 },
    ingredients: [{ itemId: 'minecraft:bamboo_planks', quantity: 6 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:bamboo_trapdoor',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:bamboo_trapdoor', quantity: 2 },
    ingredients: [{ itemId: 'minecraft:bamboo_planks', quantity: 6 }],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
  {
    id: 'minecraft:scaffolding',
    type: 'crafting_shaped',
    gridSize: '3x3',
    output: { itemId: 'minecraft:scaffolding', quantity: 6 },
    ingredients: [
      { itemId: 'minecraft:bamboo', quantity: 6 },
      { itemId: 'minecraft:string', quantity: 1 },
    ],
    priority: 100,
    isDefault: true,
    minecraftVersion: '1.21',
  },
];
