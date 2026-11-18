<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg">
    <img alt="SIFR — Built From Zero" src=".github/banner-light.svg" width="100%">
  </picture>
</p>

# SIFR — Built From Zero

Mohamed Salahy's portfolio: systems, machine learning and native graphics —
11 public repositories, interactive engineering labs, and 2D polar cipher
physics. built from zero.

## stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4, motion
- `bun.lock` + `package-lock.json` (Bun/Node both work; Node 26 verified)
- content in `src/data/repos.ts`, story in `src/data/stories.ts`

## build & verify

```sh
npm install        # (fixes: esbuild bumped to ^0.28 to satisfy vite 8 peer)
npm run lint       # tsc --noEmit (exit 0)
npm test           # node:test via tsx — 13/13 pass
npm run build      # vite build (~0.5 s)
```

verified on this machine (2026-11-17, Node 26.13.1): `npm install` exit 0,
`npm run lint` exit 0, `npm test` → 13/13 pass, `npm run build` exit 0.

## what it shows

interactive models of the portfolio's real work: allocator internals, Redis
command execution, churn prediction, capability scoring, github telemetry
(`src/lib/*.ts`, each with colocated `*.test.ts`).

## license

`MIT` — see `LICENSE`. built from zero.
