# UIPT Symbol Contract v1

**Status:** Draft for foundation review
**Authority:** `hadiranweb/UIPT/theory` and verified Rust source paths
**Consumer:** ONSOUR documentation, Rust tests, WASM bridge and future TypeScript contracts

## Symbol table

| Symbol | Meaning | Domain / unit | Runtime status | Notes |
|---|---|---|---|---|
| `θ` | Order parameter / node state | bounded conceptual domain `[-1, 1]`; runtime representation is mode-specific | Present in UIPT theory and Rust `Node.theta`; shown by ONSOUR UI | UI must identify numeric mode |
| `E` | Node/system energy | model-specific scalar | Present in UIPT theory and Rust `Node.e` | Unit must be documented per fixture |
| `E_c` | Critical energy | same scale as `E` | Present in theory and Rust `Node.ec` | `ec == 0` behavior is an explicit implementation policy |
| `J_{ji}` | Directed coupling weight | model-specific scalar | Present in Mean-Field equation and Rust `Edge.weight` | Sign and normalization must be preserved |
| `τ_{ji}` | Propagation lag | logical/runtime time units | Present in theory; not part of the currently inspected Rust `Edge` layout | Cannot be displayed as runtime state until represented in a versioned contract |
| `D(S)` | State dispersion | non-negative scalar | Present in ONSOUR web analysis and governance narrative | Exact aggregation and precision must be versioned |
| `ε(t)` | Governance tolerance/barrier | non-negative scalar | Present in ONSOUR UI and UIPT governance direction | Formula and telemetry mode must be versioned |
| `Λ` | Composite resource load | normalized scalar | Used by ONSOUR dynamic epsilon narrative | Source telemetry and normalization must be explicit |
| `ℒ` | Normalized network latency | normalized scalar | Used by ONSOUR dynamic epsilon narrative | Browser estimate is not automatically runtime authority |
| `η(t)` | Stochastic force/noise | model-specific | Present in UIPT Langevin theory | Not claimed as native deterministic runtime behavior until RNG/replay contract exists |
| `epoch` | Logical execution step | non-negative integer | Present in ONSOUR persistence and UIPT governance snapshot direction | Must not be replaced by client wall-clock time |
| `stateRoot` | State integrity identifier | versioned hash string | Intended for governance/replay | Optional until hashing contract is implemented end-to-end |

## Formula classification

### Theory-level formulas

These formulas are part of the UIPT theoretical source and must be displayed as theory, not silently presented as production runtime guarantees:

```text
V(θ) = -r θ² + u θ⁴

dθ/dt = -∂V/∂θ + η(t)

θ(t+1) = tanh((E(t) - E_c) / E_c + Σ J_ji θ_j(t - τ_ji))
```

### Governance invariant

The current ONSOUR governance contract is expressed as:

```text
D(S_candidate) ≤ D(S_current) + ε(t)
```

The implementation must record the version of the dispersion, epsilon and telemetry formulas used for each result.

### Runtime-specific formulas

The fixed-point arithmetic and `fixed_tanh` approximation in `backend/core/rts_core/src/math.rs` are runtime implementation details. They are not interchangeable with the continuous theory formulas. Their error bounds and edge-case behavior require separate numeric tests.

## Non-claims

This v1 contract does not claim quantum behavior, cross-platform bit-exactness across floating-point browser execution, or a production unit for `E`, `E_c`, `J`, `Λ` or `ℒ`. Those claims require separate evidence and must not be inferred from the symbol names.
