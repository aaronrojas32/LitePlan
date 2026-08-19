# LitePlan 🧱✨

**LitePlan** is a fast, offline-first Minecraft material planner and calculator for players using **Litematica**.

Import your Litematica `.csv` or `.txt` material exports to instantly calculate exact block requirements, stacks, Shulker box allocations, recursive raw resource gathering lists, and step-by-step crafting trees.

---

## 🚀 Features

- **Litematica Importer**: Parses both `.csv` and `.txt` material list formats from Litematica.
- **Single Source of Truth**: All quantities, stacks (`19 stacks + 32`), and storage boxes (`1 Shulker required`) derive purely from base block counts.
- **Separated Architecture**:
  - **Build Objects**: Final placed blocks controlling project progress.
  - **Crafting Requirements**: Exact integer crafts with surplus tracking (`+3 extra`) and raw resource availability.
  - **Raw Resources**: Aggregated base harvestable materials to mine, chop, and harvest.
- **Interactive Checklists**: Real-time quantity steppers and one-click completions designed to run on a second monitor while playing.
- **Offline & Local Storage**: Automatically saves all projects and settings to IndexedDB with JSON backup import/export.
- **Minecraft Texture Icons**: Integrated high-resolution texture icons for blocks and items.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/USERNAME/LitePlan.git
cd LitePlan

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Runs TypeScript typecheck and builds production bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run test:run` | Runs full Vitest test suite |
| `npm run typecheck` | Runs TypeScript typecheck (`tsc --noEmit`) |

---

## 🌿 Branching & GitHub Pages

- **`dev`**: Main development branch.
- **`releases`**: Production branch automatically built and deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

---

## 📄 License
MIT License
