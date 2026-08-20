# Changelog

All notable changes to **LitePlan** are documented in this file.

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
