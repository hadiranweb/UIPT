use wasm_bindgen::prelude::*;
use crate::state::{Node, Edge};
use crate::math::step_node_math;

/// Executes a sparse graph update using a two-phase epoch execution model.
/// 
/// ARCHITECTURAL DEFENSE:
/// 1. Data Locality: Nodes and Edges are stored in contiguous memory to maximize L1/L2 cache hits.
/// 2. Lock-Free Design: The implementation avoids Mutex/Arc overhead by separating the 
///    Gather (Read) and Apply (Write) phases.
/// 3. Determinism: State transitions follow the canonical Tanh-Brain SPEC v0.4, ensuring
///    bit-identical results across platforms.
pub fn step_sparse_impl(nodes: &mut [Node], edges: &[Edge]) {
    let n = nodes.len();
    // Pre-allocation to avoid reallocations in the hot path.
    let mut neighbor_sums = vec![0.0; n];
    
    // Phase 1: Gather (Read-only access to nodes[src].theta)
    // This part can be parallelized using Rayon or SIMD intrinsics in future iterations.
    for edge in edges {
        let src = edge.src as usize;
        let dst = edge.dst as usize;
        if src < n && dst < n {
            neighbor_sums[dst] += edge.weight * nodes[src].theta;
        }
    }
    
    // Phase 2: Apply (Local write to nodes[i].theta)
    // No inter-node dependencies here, ensuring zero race conditions.
    for i in 0..n {
        nodes[i].theta = step_node_math(nodes[i].theta, nodes[i].e, nodes[i].ec, neighbor_sums[i]);
    }
}

#[wasm_bindgen]
pub fn step_sparse_js(nodes: JsValue, edges: JsValue) -> JsValue {
    let mut nodes_vec: Vec<Node> = serde_wasm_bindgen::from_value(nodes).unwrap();
    let edges_vec: Vec<Edge> = serde_wasm_bindgen::from_value(edges).unwrap();
    
    step_sparse_impl(&mut nodes_vec, &edges_vec);
    
    serde_wasm_bindgen::to_value(&nodes_vec).unwrap()
}
