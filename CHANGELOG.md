# Changelog

All notable changes to **LitePlan** are documented in this file.

## [2.8.0] - 2026-08-20

### Added
- **Full Minecraft 1.21 Dataset Integration**:
  - Expanded `materialsDatabase.ts` to include all **1,506 Minecraft 1.21 items** with exact stack sizes, categories, and bilingual Spanish/English display names.
  - Extracted and integrated the full collection of **1,914 high-fidelity Minecraft PNG icons** into `/public/assets/minecraft/` for 100% offline, native pixelated icon rendering.
  - Added comprehensive 1.21 recipes for Pale Oak wood, Tuff families, Blackstone, Resin, Copper variants (bars, chain, lantern, bulb, grate, door, trapdoor), 16-color dyes (beds, banners, carpets, stained glass, concrete powder, glazed terracotta), and utility workstations (`crafter`, `beehive`, `lodestone`, `respawn_anchor`, `bundle`, `brush`, `spyglass`).
- **Data Integrity & Consistency**:
  - Fixed canonical ID for Eye of Ender (`minecraft:ender_eye`) and updated normalization alias mappings.
  - Ensured natural mineable rocks (Diorite, Granite, Andesite, Tuff, Deepslate, etc.) decompose correctly into raw gather checklists.

## [2.7.0] - 2026-08-20

### Added
- **Multi-Tier Recursive Recipe Resolution Engine**:
  - Full support for Minecraft 1.21 recipes (Wood, Stone, Metal Ores, Redstone, Decoration, Utility).
  - 4-Tier classification: `BUILD` -> `INTERMEDIATE` / `PROCESSING` -> `RAW`.
  - Integer craft math (`Math.ceil`), surplus production tracking, and cycle detection.
- **Recipe Inspector Tool**:
  - Interactive recipe database explorer accessible via Settings modal (`⚙️`).
  - View linear resolution paths and full recursive tree decompositions for any Minecraft item.
- **Explicit File Validation and Diagnostic Handling (Closes #22)**:
  - Added `validateLitematicaContent` with clear error explanations for empty files, invalid formats (JSON/HTML), and missing required columns (`Item`, `Total`).
  - Real-time visual feedback badges in `CreateProjectModal` (valid vs. invalid status cards with block & material counters).
- **SEO & Search Indexability**:
  - Full Open Graph and Twitter Cards metadata in `index.html`.
  - Generated `robots.txt` and `sitemap.xml` in `/public`.
  - Added 1200x630 social preview image (`og-image.png`).
- **Community & Contributor Templates**:
  - Professional GitHub Issue (`bug_report.md`, `feature_request.md`) and PR templates with contributor call-to-action sections.
  - 20 structured issues created and labeled on GitHub for community roadmap.

## [2.6.0] - 2026-08-20

### Added
- **5-Tab Architecture in Project Detail**:
  - `Overview`: Build progress overview, 4 summary metric chips, top missing build objects, and top raw resources to farm.
  - `Build`: Complete list of target build objects with quantity steppers, status chips (`Complete`, `Partial`, `Missing`), and side drawer inspection.
  - `Craft`: Action-oriented crafting operations with recipe grids, excess surplus tracking, craftable with raw resources indicator, and expandable recipe trees.
  - `Gather`: Dual collection checklist (`Build Objects` and `Raw Resources`) with steppers and one-click completion.
  - `Storage`: Storage and container calculations (Shulkers, Double Chests) and copyable storage breakdown.
- **Dashboard Overhaul**:
  - Active Build Hero card with direct progress bar and `Continue Build` action.
  - 4 Key Metrics (Active Projects, Blocks Planned, Build Progress, Raw Resources Missing).
  - Top Missing Build Objects & Top Raw Resources to Gather sections.
- **Single Source of Truth**:
  - Progress bar is driven strictly by base Build Objects.
  - Raw resources tracking updates farming inventory and crafting availability without inflating the build progress percentage.
- **Testing Suite**:
  - 33 Vitest unit tests covering single source of truth, calculation integrity, Piston manufacturing test (Section 36), double-counting prevention (Section 37), and recipe leaf aggregation (Section 38).

### Changed
- **Removed Disconnected States**: Eliminated parallel boolean state tracking in crafting and gathering lists; all completion actions update base integer quantities directly.
- **Clean Light Mode**: High-contrast, clean light theme with slate borders, royal blue accents, and Minecraft emerald highlights.

### Fixed
- Fixed React hook ordering violation in project creation modal.
- Fixed storage container calculations and stack breakdowns.
- Fixed schema migration resilience in IndexedDB.
