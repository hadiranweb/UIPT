# ONSOUR Rust / Browser Benchmark Report

## Measurement

The Rust reference measurement was produced from `backend/core/tests/benchmark_metrics.rs` in the ONSOUR core workspace using the release profile. The workload contains 10,000 `Node` values initialized with `theta = 0.1`, `e = 0.5`, and `ec = 1.0`, connected as a deterministic 10,000-node chain with edge weight `0.1`. The test performs 10 warmup epochs followed by 100 measured epochs through `step_sparse_buffered`, the Rayon-backed two-phase gather/apply implementation.

The captured result on the sandbox runner was **95.44 ns/node/epoch** across 100 iterations, or **95.444049 ms** total for the measured batch. This is a single-machine reference measurement, not a universal hardware claim; CPU model, compiler version, thread pool size, thermal state, and operating system scheduling affect the result.

## Browser comparison

The `/docs` Live Dispersion Lab runs the same deterministic chain workload locally with the same neighbor-sum ordering and `step_node_math` transformation (`tanh((e - ec) / ec + neighbor_sum)`). It measures wall-clock time using `performance.now()` in the current browser tab. The browser result is intentionally labeled as a preview measurement: it is single-threaded JavaScript and is not expected to match the parallel Rust runtime.

The comparison is a methodology tool. It helps engineers see the relative cost of the same state transition in two execution environments without implying that a browser preview is a substitute for a release-profile systems benchmark.
