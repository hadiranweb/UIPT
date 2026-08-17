use wasm_bindgen::prelude::*;
use crate::state::{Node, Edge};
use crate::math::step_node_math;

/// Executes a sparse graph update using a two-phase epoch execution model.
/// 
/// ARCHITECTURAL DEFENSE (v1.1 Updates):
/// 1. Data Locality: Nodes are 16/32-byte aligned to eliminate cache-line straddling.
/// 2. Deterministic Reduction: To ensure bitwise reproducibility across threads,
///    neighbor sums MUST be computed in a fixed order.
/// 3. Lock-Free Apply: The Apply phase is local to each node, ensuring zero write contention.
pub fn step_sparse_impl(nodes: &mut [Node], edges: &[Edge]) {
    let n = nodes.len();
    
    // Phase 1: Gather (Fixed-Order Reduction)
    // ARCHITECTURAL NOTE: In a parallel context, edges must be partitioned by 
    // destination node (CSR style) to ensure each neighbor_sum[i] has a single writer,
    // or use a deterministic reduction tree to avoid non-associative float summation drift.
    let mut neighbor_sums = vec![0.0; n];
    
    // Sequential implementation ensures deterministic order for SPEC v0.4 compliance.
    for edge in edges {
        let src = edge.src as usize;
        let dst = edge.dst as usize;
        if src < n && dst < n {
            neighbor_sums[dst] += edge.weight * nodes[src].theta;
        }
    }
    
    // Phase 2: Apply (Parallel-Safe)
    // This phase is embarrassingly parallel as each node update is independent.
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
