# UIPT & ONSOUR Ecosystem Evidence-Based Reconciliation Report

This document provides a strictly evidenced reconciliation between inspected artifacts in `hadiranweb/UIPT` and inspected files in `onsour-investor-site`.

---

## 1. Inspected Source & Target Inventory

- **UIPT Sources Inspected:**
  - `backend/core/rts_core/src/state.rs` (32-byte aligned Q32.32 fixed-point `Node` and `Edge`)
  - `backend/core/rts_core/src/math.rs` (Deterministic fixed-point multiplication, division, `fixed_tanh`)
  - `backend/core/rts_core/src/graph.rs` (`step_sparse_buffered` with Rayon parallel gather/apply)
  - `backend/core/onsour_governance/src/lib.rs` (Q16.16 `GovernanceSnapshot` and hash chaining)
  - `theory/TANH_BRAIN_MATH_CORE.md` & `UIPT-A.md` (Landau-Ginzburg potential, Langevin dynamics)
- **ONSOUR Targets Inspected:**
  - `client/src/pages/Theory.tsx` (UIPT-A foundational theory and math framework cards)
  - `client/src/pages/Docs.tsx` (Live Dispersion Lab canvas animation loop, particle flow, node rendering)
  - `server/routers.ts` (tRPC `analysis.save` and `list` procedures for MySQL persistence)

---

## 2. Strict Source-to-Target Matrix

| UIPT Source Path | ONSOUR Target Path | Inspected Overlap & Technical Divergence | Status |
| :--- | :--- | :--- | :--- |
| `backend/core/rts_core/src/graph.rs` | `client/src/pages/Docs.tsx` (Canvas loop) | **Divergence in Runtime Domain:** UIPT uses Rayon multi-threaded Rust for backend execution; ONSOUR uses HTML5 canvas 2D context with `requestAnimationFrame` for interactive browser visualization. | **Complementary** |
| `backend/core/onsour_governance/src/lib.rs` | `server/routers.ts` (`analysis` router) | **Divergence in Persistence Layer:** UIPT uses SHA-256 hash chains over Rust memory snapshots; ONSOUR uses Drizzle ORM and MySQL table records (`saved_analyses`) for web client persistence. | **Complementary** |
| `theory/TANH_BRAIN_MATH_CORE.md` | `client/src/pages/Theory.tsx` | **Semantic Alignment:** Both articulate UIPT equations, order parameter $\theta$, state dispersion $D(S)$, and dynamic epsilon barriers $\varepsilon(t)$. | **Fully Aligned** |

---

## 3. Conclusion & Centralization Directive

The parallel `hadiranweb/UIPT` repository serves as the low-level Rust runtime spec and mathematical UIPT core, while `onsour-investor-site` provides the production web platform, interactive dispersion lab, database persistence, and investor presentation site. Both operate as mutually supportive pillars of the unified ONSOUR ecosystem.
