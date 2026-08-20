# LitePlan

LitePlan is an offline-first web tool for planning and calculating materials required for Minecraft builds using Litematica schematic exports.

It parses material lists exported from Litematica, calculates exact block requirements, breaks down stacks and storage container counts, and recursively computes crafting trees down to base raw resources.

---

## Features

- **File Parsing**: Imports `.csv`, `.tsv`, and ASCII table `.txt` material files exported by Litematica.
- **Quantity Calculations**:
  - Exact total item counts maintained as the single source of truth.
  - Stack breakdowns based on item stack size (64, 16, or 1).
  - Container allocation for Shulker Boxes (27 slots) and Double Chests (54 slots).
- **Crafting & Recipe Trees**:
  - Recursive recipe resolution down to base harvestable materials.
  - Calculation of required craft operations and surplus item tracking.
  - Detection of whether intermediate items can be crafted from available raw resources.
- **Interactive Checklists**:
  - Independent tracking for build blocks and raw resources.
  - Real-time steppers to record gathered items during gameplay.
- **Local Persistence & Export**:
  - IndexedDB storage for projects, progress, and settings.
  - Full backup import and export as JSON.
  - Export material lists and crafting steps to `.csv` or `.txt`.
- **Interface**:
  - High-contrast light interface optimized for desktop and secondary displays.
  - Minecraft item and block texture rendering.

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

---

## Project Structure

```text
src/
├── components/          # React UI components (tables, modals, checklists)
│   ├── dashboard/       # Dashboard and project detail views
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

- **`dev`**: Active development branch. All pull requests and new features should target this branch. Commits run automated CI validation.
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
