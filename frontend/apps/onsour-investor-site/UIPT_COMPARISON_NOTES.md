# UIPT to ONSOUR Source-to-Target Comparison Notes

This document records direct comparison notes between inspected source files in `hadiranweb/UIPT` and inspected target files in `onsour-investor-site`.

---

## 1. Runtime & Simulation Comparison
- **UIPT Source (`backend/core/rts_core/src/graph.rs`):** Implements Rayon parallel buffered execution (`step_sparse_buffered`) with deterministic adjacency sorting by source index during Phase 1 (Gather) and independent parallel node updates during Phase 2 (Apply).
- **ONSOUR Target (`client/src/pages/Docs.tsx`, lines 516-607):** Implements a browser-side interactive canvas animation loop using `requestAnimationFrame`, particle flow animation along weighted edges (`edgeDistance > 24`), node pulsing halos, and delta-color classification based on theta movement (`getDelta(node)`).
- **Overlap & Gap:** Both architectures share the conceptual separation between current activation states and candidate movement updates. However, UIPT performs fixed-point Q32.32 parallel multi-threading in Rust, while ONSOUR performs floating-point browser rendering for responsive UI interaction.

---

## 2. Governance & Persistence Comparison
- **UIPT Source (`backend/core/onsour_governance/src/lib.rs`):** Implements Q16.16 fixed-point snapshots (`GovernanceSnapshot`) with SHA-256 hash chaining for epoch auditability.
- **ONSOUR Target (`server/routers.ts`, lines 10-41):** Implements `analysis.save` public tRPC procedure taking epoch numbers, node/edge counts, dispersion strings, epsilon, adaptation metrics, decisions, and raw JSON payloads, persisting them via Drizzle ORM to MySQL.
- **Overlap & Gap:** Both repositories track epoch-level execution metrics. UIPT provides cryptographic audit trails in Rust, whereas ONSOUR provides database CRUD persistence and historical adaptation trend visualization in the web frontend.

---

## 3. Theory & Documentation Comparison
- **UIPT Source (`theory/TANH_BRAIN_MATH_CORE.md`, `theory/UIPT-A.md`):** Formulates Landau-Ginzburg double-well potentials $V(\theta) = -r\theta^2 + u\theta^4$, stochastic Langevin dynamics, and Mean-Field Tanh equations.
- **ONSOUR Target (`client/src/pages/Theory.tsx`):** Renders foundational UIPT-A narrative, the Three Phases of Cognitive Capability, and math cards for Order Parameter $\theta$, State Dispersion $D(S)$, Dynamic Epsilon $\varepsilon(t)$, and Thermodynamic Governance.
- **Overlap & Gap:** High semantic overlap. ONSOUR's theory page translates the core theoretical framework into a professional investor and research landing page.
