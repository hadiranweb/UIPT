import fs from 'fs';
import { step_simulation } from './pkg/rts_wasm.js';

const input = JSON.parse(fs.readFileSync(0, 'utf-8'));

let current = input.nodes;
let edges = input.edges;
let steps = input.steps;

for (let i = 0; i < steps; i++) {
    current = step_simulation(current, edges);
}

console.log(JSON.stringify({ final_nodes: current }));
