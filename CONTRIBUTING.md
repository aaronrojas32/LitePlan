# Contributing to LitePlan

Thank you for contributing to LitePlan! Please follow these workflow guidelines to keep development smooth and releases reliable.

---

## 1. Branch Strategy

We follow a two-branch git model:

- **`dev`**: Active development branch. All feature branches and bug fixes merge into `dev`.
- **`releases`**: Production branch deployed to GitHub Pages. Only stable, tested versions of `dev` merge into `releases`.

```
feature / fix branch
        ↓
       dev (CI Quality Gate)
        ↓
    releases (GitHub Pages Deployment)
```

---

## 2. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Run typecheck & tests
npm run typecheck
npm run test:run

# 4. Test production build locally
npm run build
npm run preview
```

---

## 3. Creating a Release

1. Ensure all tests and typechecks pass on `dev`:
   ```bash
   npm run typecheck
   npm run test:run
   npm run build
   ```
2. Update version in `package.json` and add release notes to `CHANGELOG.md`.
3. Merge `dev` into `releases`:
   ```bash
   git checkout releases
   git merge dev --no-ff -m "Release v2.6.0"
   git push origin releases
   ```
4. GitHub Actions will automatically deploy `dist/` to GitHub Pages.
