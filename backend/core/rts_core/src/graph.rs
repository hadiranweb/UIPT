use wasm_bindgen::prelude::*;
use crate::state::{Node, Edge};
use crate::math::step_node_math;

pub fn step_sparse_impl(nodes: &mut [Node], edges: &[Edge]) {
    let n = nodes.len();
    let mut neighbor_sums = vec![0.0; n];
    
    for edge in edges {
        let src = edge.src as usize;
        let dst = edge.dst as usize;
        if src < n && dst < n {
            neighbor_sums[dst] += edge.weight * nodes[src].theta;
        }
    }
    
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
