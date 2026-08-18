use wasm_bindgen::prelude::*;
use rts_core::{Node, Edge, step_sparse_buffered};
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[derive(Serialize, Deserialize)]
pub struct WasmNode {
    pub theta: f32,
    pub e: f32,
    pub ec: f32,
}

#[derive(Serialize, Deserialize)]
pub struct WasmEdge {
    pub src: u32,
    pub dst: u32,
    pub weight: f32,
}

#[wasm_bindgen]
pub fn step_simulation(
    current_nodes_val: JsValue,
    edges_val: JsValue,
) -> Result<JsValue, JsValue> {
    let current_wasm_nodes: Vec<WasmNode> = serde_wasm_bindgen::from_value(current_nodes_val)?;
    let wasm_edges: Vec<WasmEdge> = serde_wasm_bindgen::from_value(edges_val)?;

    let current_nodes: Vec<Node> = current_wasm_nodes.into_iter().map(|n| Node {
        theta: n.theta,
        e: n.e,
        ec: n.ec,
        _padding: 0,
    }).collect();

    let edges: Vec<Edge> = wasm_edges.into_iter().map(|e| Edge {
        src: e.src,
        dst: e.dst,
        weight: e.weight,
        _padding: 0,
    }).collect();

    let mut next_nodes = vec![Node::default(); current_nodes.len()];
    
    // Execute core simulation logic
    step_sparse_buffered(&current_nodes, &mut next_nodes, &edges);

    let next_wasm_nodes: Vec<WasmNode> = next_nodes.into_iter().map(|n| WasmNode {
        theta: n.theta,
        e: n.e,
        ec: n.ec,
    }).collect();

    Ok(serde_wasm_bindgen::to_value(&next_wasm_nodes)?)
}

#[wasm_bindgen]
pub fn get_version() -> String {
    "ONSOUR-WASM-v0.3.0".to_string()
}
