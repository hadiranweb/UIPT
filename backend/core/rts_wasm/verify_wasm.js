const fs = require('fs');
const { step_simulation } = require('./pkg/rts_wasm.js');

const input = JSON.parse(fs.readFileSync(0, 'utf-8'));

let current = input.nodes;
let edges = input.edges;
let steps = input.steps;

// console.error("Input Nodes Sample:", current[0]);

for (let i = 0; i < steps; i++) {
    try {
        current = step_simulation(current, edges);
    } catch (e) {
        console.error("Error at step", i, e);
        process.exit(1);
    }
}

process.stdout.write(JSON.stringify({ final_nodes: current }));
