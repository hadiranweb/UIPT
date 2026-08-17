# ONSOUR Unified Ecosystem (`onsour-unified`)

## Overview
The ONSOUR Unified Monorepo integrates all theoretical models, high-performance backends, user-facing applications, and specialized MCP services into a single, cohesive codebase. Grounded in the **Unified Interactive Phase Transition (UIPT)** and **Tanh-Brain** architectures, this repository bridges scientific research with production-grade runtime execution.

## Monorepo Structure
```text
onsour-unified/
├── theory/               # Tanh-Brain, Financial-Computation, Noqte (Python/Docs)
├── backend/              # Rust Workspace & Services
│   ├── core/             # rts_core (Langevin / Ising Runtime v0.4)
│   ├── platform/         # Pema platform components & synaptic hub
│   └── mcp/              # casio-plus (AI Tool Integration)
├── frontend/             # Next.js / Remix Applications
│   ├── apps/
│   │   ├── portal/       # Onsur Main Application
│   │   └── genflow/      # GenFlow Workflow Platform
│   └── packages/         # Shared UI & Domain Contracts
├── agents/               # Telegram bots & automation workers
├── docs/                 # OmniArch, Runtime Reports, Glue Code Strategy
└── infra/                # Deployment and container configurations
```

## Core Engines & Specifications
- **Runtime SPEC:** v0.4 (`backend/core/rts_core`)
- **Mathematical Core:** $\theta = \tanh((E - E_c)/E_c)$
- **Cross-Language Glue:** See [GLUE_CODE_STRATEGY.md](./docs/GLUE_CODE_STRATEGY.md)

## Getting Started
### Running Backend Core Tests
```bash
cd backend/core/rts_core
cargo test
cargo bench
```

### Running Python Reference Validation
```bash
cd theory/python_reference
python3 generate_test_vectors.py
```
