# Changelog

All notable changes to **LitePlan** are documented in this file.

## [2.6.0] - 2026-08-19

### Added
- **Dual Checklist System**: Clear architectural separation between **Build Objects** (controls overall progress) and **Raw Resources** (tracks base harvest inventory and crafting availability without inflating build progress).
- **Crafting Availability**: Automatic calculation of craftable item counts based on owned raw resources (`craftableWithRaw`).
- **Interactive Checklists**: Steppers (`- / +`) and instant `[Complete]` toggles with immediate synchronization across project progress, summary, and dashboard.
- **GitHub Actions Workflows**:
  - `.github/workflows/ci.yml` for automated testing and typechecks on `dev`.
  - `.github/workflows/deploy.yml` for zero-configuration GitHub Pages deployments on `releases`.
- **Git Branching Architecture**: `dev` for active development and `releases` for production deployments.
- **Comprehensive Unit Tests**: Vitest suite covering edge cases (cases 1-5, progress clamping, no double counting, raw aggregation).

### Changed
- **Project Card Redesign**: Clean visual hierarchy with 32px Minecraft texture cover, block counts, material counts, precise build progress bar (`10,862 / 18,783 blocks`), and contextual dropdown actions.
- **Widescreen Responsive Layout**: Extended main canvas up to `1600px` for optimal viewing on desktop and laptop monitors.
- **Visual Palette**: Modern Blue (`#2563eb`) and Minecraft Emerald Green (`#10b981`) with default clean light mode.
- **Vite Configuration**: Configured relative base path resolution (`./`) to support GitHub Pages subpaths seamlessly.

### Fixed
- Fixed checklist progress desynchronization.
- Fixed single source of truth for all quantity derivations.
- Fixed raw materials duplicating in recipe breakdowns.
- Fixed missing project migration fallback for legacy stored projects.
