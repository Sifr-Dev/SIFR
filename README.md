<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg">
    <img alt="SIFR — Built From Zero" src=".github/banner-light.svg" width="100%">
  </picture>
</p>

# SIFR — Built From Zero

Mohamed Salahy's (`Sifr-Dev`) engineering portfolio across systems programming, machine learning kernels, and native Linux graphics — 20 public repositories, interactive architecture & benchmark labs, searchable technical dossiers, and a 24-cell polar cipher canvas built from first principles.

- **Live Portfolio:** [sifr-dev.vercel.app](https://sifr-dev.vercel.app)
- **GitHub:** [github.com/Sifr-Dev](https://github.com/Sifr-Dev)
- **LinkedIn:** [linkedin.com/in/mohamed-salahy](https://www.linkedin.com/in/mohamed-salahy)

## Flagship Systems

- **Cipher** — Zero-dependency Linux graphics & UI framework in Zig 0.17.1 (`dlopen` `libwayland-client.so.0` + generated `wl_interface` tables, `dlopen` `libvulkan.so.1`, custom SFNT parser, scanline AA R8 glyph atlas, 2-pass flexbox, software SHM fallback).
- **CipherDesk** — Desktop applications built directly on Cipher linking only `libc`: `janus` (GPU-native terminal), `rex` (Unix-socket multiplexer engine), and `nocturne` (offline bit-exact FLAC music player).
- **subtorch** — Fused RMSNorm & FlashAttention kernels across PyTorch, Triton, Inductor, and JAX XLA with zero-copy DLPack and 36 numerical parity checks.
- **verrev** — Early-stage post-quantum peer-to-peer OS prototype in pure Rust (`verrev-hash` Keccak-f[1600], `verrev-crypto` ML-KEM-1024 / ML-DSA-87 / XChaCha20-Poly1305, `verrev-identity`, `verrev-capability`, 48 passing workspace tests across 7 crates).

## Stack

- React 19, TypeScript, Vite 8, Tailwind CSS 4, Express, Recharts
- Content & verified technical metadata in `src/data/repos.ts`, `src/data/stories.ts`, and `src/data/benchmarks.ts`

## Build & Verify

```sh
npm install
npm run lint       # tsc --noEmit
npm test           # node:test via tsx across src/lib/*.test.ts
npm run build      # vite build
npm run dev        # Express + Vite middleware on port 3000
```

## What It Demonstrates

Interactive simulations and engineering dossiers grounded in the repositories under `https://github.com/Sifr-Dev`: free-list allocator coalescing, bounded RESP2 key-value storage, logistic scoring, capability tokens, Kademlia XOR distance, Wayland/Vulkan geometry, and live GitHub telemetry sync (`src/lib/*.ts`, each with colocated `*.test.ts`).

## License

`MIT` — see `LICENSE`.
