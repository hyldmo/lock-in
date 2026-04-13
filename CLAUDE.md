# Lock In - Chrome Extension

Site blocker Chrome extension built with Svelte, TypeScript, Vite.

## Commands

```bash
yarn --immutable    # Install dependencies
yarn biome ci       # Lint + format check
yarn lint:tsc       # TypeScript type check
yarn test           # Run vitest tests
yarn dev            # Dev build with HMR
yarn prod           # Production build
```

## CI

- **PR.yml**: Runs `biome ci`, `lint:tsc`, `test` on PRs to main
- **Publish.yml**: Same checks + version bump + Chrome Web Store upload on push to main
