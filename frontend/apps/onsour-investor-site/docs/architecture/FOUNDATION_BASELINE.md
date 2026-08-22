# ONSOUR Foundation Baseline

**Baseline date:** 2026-08-20  
**ONSOUR web repository:** `onsour-investor-site`  
**UIPT reference repository:** `hadiranweb/UIPT`  
**GenFlow status:** external, frozen, and explicitly out of scope for this execution cycle

## Repository anchors

| Repository | Local path | Baseline commit | Role in this cycle | Mutation policy |
|---|---|---|---|---|
| ONSOUR web | `/home/ubuntu/onsour-investor-site` | `0d64ae53db578c4573d01622084027f41d7005f8` | Product surface, Live Dispersion Lab, Graph Explorer, Theory, Docs, tRPC and persistence | Allowed only inside ONSOUR |
| UIPT unified | `/tmp/UIPT` | `78e615d9f1465f71acfd6c330e2e3160b0afdaf3` | Theory and Rust/WASM reference core | Read-only reference during baseline |
| GenFlow | External project | Not imported | Future consumer through a versioned adapter | No changes, copies, dependencies, or runtime coupling |

The ONSOUR working tree had pre-existing changes at baseline: `UIPT_RECONCILIATION_REPORT.md`, `todo.md`, and `UIPT_COMPARISON_NOTES.md`. These are treated as part of the current working context and are not attributed to the new foundation layer work.

## ONSOUR toolchain and product surface

| Area | Verified baseline |
|---|---|
| Runtime | Node `v22.13.0`, pnpm `10.4.1` |
| Frontend | React 19, TypeScript 5.9.3, Vite 7.1.7, Tailwind 4 |
| Server | Express 4, tRPC 11, Drizzle ORM, MySQL/TiDB adapter |
| Test/build commands | `pnpm test`, `pnpm check`, `pnpm build`, `pnpm db:push` |
| Routes | `/`, `/docs`, `/theory`, `/404` |
| Core pages | `client/src/pages/Home.tsx`, `Docs.tsx`, `Theory.tsx` |
| Persistence | `drizzle/schema.ts`, `server/db.ts`, `server/routers.ts`, `saved_analyses` |
| Graph contract currently visible to UI | `GraphNode { id, theta, label?, tags? }`, `GraphEdge { src, dst, weight }` |
| Current web mode | Browser-side floating-point analysis and canvas visualization; native Rust/WASM parity is not yet claimed |

## UIPT workspace and runtime surface

| Area | Verified baseline |
|---|---|
| Rust workspace | `backend/Cargo.toml`, resolver 2, edition 2021, MIT |
| Workspace members | `core/rts_core`, `core/rts_wasm`, `runtime`, `synaptic-hub`, `islands/commerce_reef`, `islands/finance_lagoon`, `core/onsour_governance` |
| Rust dependencies named at workspace level | `wasm-bindgen`, `serde`, `serde-wasm-bindgen`, `tokio`, `rayon`, `rand`, `rand_distr`, `log`, `env_logger` |
| Core crates | `backend/core/rts_core`, `backend/core/rts_wasm`, `backend/core/onsour_governance` |
| Theory | `theory/UIPT-A.md`, `theory/TANH_BRAIN_MATH_CORE.md` |
| Runtime algorithm sources | `backend/core/rts_core/src/state.rs`, `math.rs`, `graph.rs` |
| Governance source | `backend/core/onsour_governance/src/lib.rs` |
| Existing build intent | `wasm-pack build` for `rts_core`; `cargo test --manifest-path backend/Cargo.toml` |

## Source-of-truth boundaries

| Concern | Authoritative source | Web responsibility |
|---|---|---|
| UIPT definitions and equations | UIPT theory files | Explain, label, and link to the source; do not silently alter equations |
| Fixed-point state and graph execution | UIPT Rust crates after correctness gates | Consume through a versioned boundary; never depend on Rust memory layout directly |
| Governance formula and snapshot semantics | UIPT governance crate after replay gates | Display decisions and provenance; do not reimplement authoritative decisions in JSX |
| Graph display and interaction | ONSOUR `Docs.tsx` and shared UI contracts | Render, inspect, filter, export and explain graph state |
| Persistence | ONSOUR Drizzle/tRPC layer | Store versioned metadata and references; do not store native memory dumps |
| Future GenFlow connection | A future adapter package | No implementation in this cycle |

## Baseline acceptance record

This baseline is accepted only as a scope and provenance record. It does not claim that browser floating-point execution is bit-exact with Rust, that public persistence is authenticated, or that any performance benchmark is production-certified. Those are separate gates in the foundation plan.

The next implementation target is the architecture decision record and versioned contracts; no GenFlow artifact is required for either deliverable.
