# LitePlan

LitePlan is an offline-first web application for planning and calculating materials required for Minecraft builds using Litematica schematic exports.

It parses material lists exported from Litematica, calculates exact block requirements, breaks down stacks and storage container counts, and recursively computes crafting trees down to base raw resources.

---

## Core Planning Chain

LitePlan organizes material planning into a single logical chain:

```text
BUILD (What the construction requires to place)
  ↓
CRAFT (What you need to manufacture from ingredients)
  ↓
GATHER (Base raw resources you need to harvest/mine)
  ↓
STORAGE (How to organize and transport materials in Shulkers and Chests)
```

---

## Navigation & Sections

1. **Overview**: High-level build progress, summary metrics (Build Objects, Crafts Needed, Raw Resources, Storage Boxes), and quick lists for top missing items.
2. **Build (Build Objects)**: Complete list of target blocks needed for placement. Updating owned quantities here directly controls the Project Build Progress. Includes filters (All, Missing, Partial, Complete), sort options, and detailed side drawer inspection.
3. **Craft**: Action-oriented crafting operations showing recipe grids (2x2, 3x3, furnace, smoker, blast furnace, stonecutter, smithing), surplus item tracking, and availability from current raw inventory. Actions increment build object quantities directly.
4. **Gather**: Real-time interactive collection lists split into:
   - **Build Objects**: Final construction items (drives project completion percentage).
   - **Raw Resources**: Base harvestable materials (tracks raw farming inventory without inflating build progress).
5. **Storage**: Container calculations (27 slots per Shulker Box, 54 slots per Double Chest) and plain-text export for container organization.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation & Development

```bash
# Clone repository
git clone https://github.com/aaronrojas32/LitePlan.git
cd LitePlan

# Ensure you are on the development branch
git checkout dev

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Builds production bundle into `dist/` |
| `npm run preview` | Runs local server to preview production build |
| `npm run test` | Starts Vitest in watch mode |
| `npm run test:run` | Runs full Vitest test suite once |
| `npm run typecheck` | Runs TypeScript type checker without emitting files |
| `npm run lint` | Runs type and lint checks |

---

## Project Structure

```text
src/
├── components/          # React UI components (tables, modals, checklists)
│   ├── dashboard/       # Dashboard, project detail (5 core tabs), and project cards
│   └── modals/          # Create, rename, delete, and settings modals
├── context/             # React contexts (toast, theme)
├── data/                # Minecraft item mappings, recipes, and sample data
├── lib/
│   ├── calculations/    # Core math: aggregator, quantities, recipes, storage
│   ├── export/          # CSV, TXT, and JSON export utilities
│   ├── minecraft/       # Item resolution and translations
│   ├── parser/          # CSV and TXT ASCII parser implementations
│   └── storage/         # IndexedDB wrapper and schema migrations
├── test/                # Unit test suites (Vitest)
└── types/               # TypeScript interfaces and type definitions
```

---

## Branching & Deployment

- **`dev`**: Active development branch. All pull requests and new features target this branch. Commits run automated CI validation.
- **`releases`**: Production branch. Merges into this branch trigger automatic build and deployment to GitHub Pages.

---

## Contributing

1. Check open [Issues](https://github.com/aaronrojas32/LitePlan/issues) or open a new one to discuss changes.
2. Fork the repository and create a branch off `dev`.
3. Ensure all tests pass and there are no type errors (`npm run typecheck && npm run test:run`).
4. Submit a Pull Request targeting `dev`.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
