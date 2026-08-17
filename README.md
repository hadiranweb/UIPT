# UIPT (Unified Interactive Phase Transition)

## Overview
UIPT is a theoretical and computational framework for high-performance, autonomous agents governed by phase transition dynamics. This repository hosts the official implementation of the **UIPT-RUNTIME-SPEC**, providing a sub-microsecond Rust core for real-time applications.

## Project Structure
*   **`rts_core/`**: The high-performance Rust implementation of the UIPT mathematical core. Optimized for low-latency and minimal memory footprint.
*   **`python_reference/`**: The "Frozen" reference implementation in Python used for scientific validation and numeric equivalence testing (Track C).
*   **`evaluation/`**: Tools for benchmarking performance, measuring binary sizes, and verifying numeric accuracy.
*   **`results/`**: Latest benchmark reports, memory layout analysis, and PASS/MISS tables.
*   **`TANH_BRAIN_MATH_CORE.md`**: Structured summary of the Tanh-Brain mathematical architecture.
*   **`UIPT-A.md`**: Theoretical framework and abstract for Unified Interactive Phase Transition.

## Key Specifications (v0.4)
- **Core Equation:** $\theta = \tanh((E - E_c)/E_c)$
- **Latency Target:** < 500 ns per node update.
- **Memory Target:** $\le 32$ bytes per practical node.
- **Numeric Equivalence:** Verified against Python reference with error $< 10^{-5}$.

## Getting Started
### Rust Runtime
```bash
cd rts_core
cargo build --release
cargo test
cargo bench
```

### Python Reference
```bash
cd python_reference
python3 generate_test_vectors.py
```

## Documentation
For a deep dive into the math, see [TANH_BRAIN_MATH_CORE.md](./TANH_BRAIN_MATH_CORE.md). For the theoretical background, refer to [UIPT-A.md](./UIPT-A.md).
