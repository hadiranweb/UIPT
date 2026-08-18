/**
 * ONSOUR WASM Bridge: TypeScript Glue Code Example
 * This script demonstrates how to integrate the Tanh-Brain Rust core into a TS project.
 */

import init, { step_simulation, get_version } from './pkg/rts_wasm.js';

async function runSimulation() {
    // 1. Initialize WASM module
    await init();
    console.log(`Connected to: ${get_version()}`);

    // 2. Define simulation data
    const nodes = [
        { theta: 0.1, e: 10.0, ec: 5.0 },
        { theta: -0.2, e: 8.0, ec: 4.0 }
    ];

    const edges = [
        { src: 0, dst: 1, weight: 0.5 },
        { src: 1, dst: 0, weight: 0.3 }
    ];

    console.log("Initial State:", nodes);

    // 3. Execute one simulation step
    try {
        const nextState = step_simulation(nodes, edges);
        console.log("Next State (Epoch 1):", nextState);
    } catch (error) {
        console.error("Simulation failed:", error);
    }
}

// Execute
runSimulation();
