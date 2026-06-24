# MAPF Solution Validator (WebAssembly)

A Rust/WebAssembly rewrite of the [`validator`](../validator) package. It
validates Multi-Agent Path Finding solutions — checking for collisions,
out-of-bounds moves, environment collisions and goal completion — and reports
the total solution cost.

The validation hot loop runs in WebAssembly; the JavaScript surface is a single
`validate()` call plus the run-length `encode`/`decode` helpers.

## Prerequisites

Built with [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) following the
[MDN "Compiling Rust to WebAssembly"](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Rust_to_Wasm)
guide. You need the Rust toolchain and `wasm-pack`:

```bash
curl https://sh.rustup.rs -sSf | sh        # Rust toolchain
cargo install wasm-pack                     # or: https://rustwasm.github.io/wasm-pack/installer/
```

## Build

```bash
# Bundler target (Vite/webpack — what the client uses). Output -> ./pkg
wasm-pack build --target bundler --release

# Node/Bun target (e.g. the server's validation worker)
wasm-pack build --target nodejs --release --out-dir pkg-node
```

The generated `pkg/` directory is a ready-to-publish npm package
(`validator-wasm`). It is git-ignored — build it as part of your pipeline.

## Test

```bash
cargo test                 # native unit + integration tests (mirrors validator/tests)
```

## Usage

```ts
import { validate, encode, decode } from "validator-wasm";

const T = true;
const _ = false;

const { errors, cost } = validate({
  paths: ["d2r"], // run-length encoded actions (u/d/l/r/w); "d2r" -> "drr"
  domain: {
    width: 2,
    height: 2,
    // Blocked cells, indexed cells[y][x]
    cells: [
      [T, _],
      [_, _],
    ],
  },
  sources: [{ x: 0, y: 0 }],
  goals: [{ x: 1, y: 1 }],
  checks: [
    "immediateCollision",
    "domainOutOfBounds",
    "domainCollision",
    "edgeCollision",
    "goalReached",
  ],
  stopOnFirstError: true, // default; set false to collect every error
});
```

### Input

| Field              | Type                                              | Notes                                                              |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------ |
| `paths`            | `string[]`                                        | One run-length encoded action string per agent.                    |
| `domain`           | `{ width, height, cells: boolean[][] }`           | `cells[y][x]` is `true` for blocked tiles.                         |
| `sources`          | `{ x, y }[]`                                       | Each agent's start position.                                       |
| `goals`            | `{ x, y }[]`                                       | Each agent's goal (only needed for `goalReached`).                |
| `checks`           | `string[]`                                         | Checks to run, **in order**. See below. Defaults to edge+immediate. |
| `stopOnFirstError` | `boolean`                                          | Stop at the first failing check (default `true`).                  |

Available checks (accepted as either `edgeCollision` or `checkEdgeCollision`):
`immediateCollision`, `domainOutOfBounds`, `domainCollision`, `edgeCollision`,
`goalReached`. An unknown name is an error.

### Output

```ts
type ValidateOutput = {
  errors: {
    errors: string[]; // human-readable messages
    errorAgents: number[];
    errorTimesteps: number[];
  }[];
  cost: number; // sum of every decoded path's length
};
```

A solution is valid when `errors` is empty.

## Publishing to npm

Following the MDN guide:

```bash
wasm-pack build --target bundler --release
cd pkg
npm publish        # or: npm pack / wasm-pack publish
```

## Relationship to `validator`

This crate is a faithful behavioural port of the TypeScript `validator`,
including its error message formats. The one deliberate API change: instead of
passing JavaScript check callbacks (which would be invoked across the wasm
boundary on every timestep), you pass a list of check names and receive the
collected errors back. `Reader`/`Seeker`/`Chunk` are not exposed — they were
implementation details of streaming seeks; the wasm engine decodes paths
internally.
