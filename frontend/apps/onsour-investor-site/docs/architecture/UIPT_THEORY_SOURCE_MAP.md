# ONSOUR / UIPT Theory Source Map & Implementation Status

This document is the traceability boundary between the UIPT mathematical references, the ONSOUR Theory page, the browser-only educational visualizations, and the native Rust/WASM runtime. A browser visualization is not treated as proof of native parity unless a versioned parity test explicitly exists.

## 1. Mathematical and Visualization Mapping

| Mathematical construct | Source reference | Theory page visualization | Runtime relationship | Status and boundary |
|---|---|---|---|---|
| **Landau–Ginzburg potential** `V(θ) = −rθ² + uθ⁴` | `UIPT-A.md` § 2.1 | `InteractivePotentialExplorer.tsx` renders a deterministic SVG curve, validates `u > 0`, identifies local minima, and exposes `r/u` controls. | Provides the conceptual potential landscape used to explain symmetry breaking; it does not replace the native numeric kernel. | `THEORY + BROWSER PREVIEW`; floating-point educational model. |
| **Spontaneous symmetry breaking** and pitchfork structure | `UIPT-A.md` § 2.1–2.2 | `PhaseTransitionMap.tsx` provides Classical, Critical and Agentic presets and a conceptual energy/order-parameter map. | The labels explain the UIPT phase model; they are not a claim that the browser has implemented a quantum computer or a complete phase-transition solver. | `THEORY`; conceptual map, not a measured runtime result. |
| **Langevin dynamics** `dθ/dt = −∂V/∂θ + η(t)` | `UIPT-A.md` § 2.3 | `LangevinPathPreview.tsx` produces a bounded, seeded browser trajectory with configurable `dt`, noise and initial `θ`. | Demonstrates the direction/noise relationship in the UI; the browser PRNG is not asserted to be hardware- or Rust-RNG equivalent. | `BROWSER PREVIEW / STOCHASTIC ILLUSTRATION`; replayable only within this preview implementation. |
| **Mean-field tanh response** `θ(t+1) = tanh((E(t)−E_c)/E_c + ΣJ_jiθ_j(t−τ_ji))` | `TANH_BRAIN_MATH_CORE.md` | `TanhResponseExplorer.tsx` plots the bounded tanh response and marks the current mean-field input/output. | Mirrors the browser-side conceptual response and the documented numeric contract; it is not a bit-exact Q32.32 result. | `RUNTIME CONTRACT / PREVIEW`; `browser-f64-preview`. |
| **Order parameter** `θ ∈ [−1, 1]` | `UIPT-A.md`; `docs/contracts/UIPT_SYMBOL_CONTRACT_V1.md` | Used as the vertical domain and readout in all four visualizations. | Shared semantic contract for graph nodes and state transitions. | `CONTRACT`; bounded domain validated in browser inputs. |
| **State dispersion** `D(S) = (1/N)Σ(θᵢ−μθ)²` | `shared/uipt-contracts.ts` Graph Analysis v1 | Displayed in the Live Dispersion Lab on `/docs`, not recomputed as a Theory visualization. | Persisted through the analysis contract and provenance fields. | `RUNTIME / PERSISTENCE`; separate from educational Theory previews. |
| **Dynamic epsilon barrier** `ε(t)` | ONSOUR governance contract and `UIPT_RECONCILIATION_REPORT.md` | Explained by the existing formal definition card; no new Theory chart claims to measure live telemetry. | Used in governance decision metadata and analysis persistence. | `GOVERNANCE CONTRACT`; live behavior belongs to `/docs`. |
| **Thermodynamic invariant** `D(Sₜ₊₁) ≤ D(Sₜ) + ε(t)` | Governance contract | Shown as a formal equation and connected to the technical path toward Rust. | Governs candidate acceptance/rollback in the analysis workflow. | `GOVERNANCE CONTRACT`; not inferred from visual previews. |

## 2. Visualization Provenance

All interactive Theory panels expose or derive the following provenance labels:

| Field | Value in Theory preview | Meaning |
|---|---|---|
| `schemaVersion` | `uipt-theory-v1` | Version of the educational visualization contract. |
| `engineVersion` | `educational-preview` | Browser visualization engine, not the native Rust engine. |
| `numericMode` | `browser-f64-preview` | JavaScript floating-point calculations used for visualization. |
| Native target | `Rust Q32.32 / WASM boundary` | The separate runtime target that must be verified by parity fixtures before any equivalence claim. |

## 3. Verification Protocol for the Independent Core

- **State and memory layout:** `state.rs` must be verified with `repr(C)` size, alignment, field-order, offset and serialization tests. Cache-line or alignment claims must not be presented as correctness evidence.
- **Numeric kernel:** `math.rs` must provide fixed-point Q32.32 vectors for multiplication, division, conversion and bounded tanh, including overflow and invalid-denominator policies.
- **Graph kernel:** `graph.rs` must enforce immutable `State(t)`, deterministic adjacency, conflict-free Gather, isolated Apply writes into `State(t+1)`, and a buffer swap only after the epoch barrier.
- **Governance:** the candidate state, epsilon, decision, state root and snapshot hash must be versioned and replayable. A Theory preview cannot independently establish rollback correctness.
- **WASM:** the browser fallback remains authoritative until native/WASM fixtures, ownership, API versioning and replay behavior have been verified on the target browsers.

## 4. Explicit Non-Claims

The Theory page does not claim bit-exact equality between JavaScript floating point and Q32.32 fixed point, hardware-level Langevin RNG parity, production quantum execution, or performance characteristics not supported by a measured benchmark. These boundaries are deliberate parts of the ONSOUR independent-core architecture.
