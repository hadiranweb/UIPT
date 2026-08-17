use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
#[repr(C)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Node {
    pub theta: f32,
    pub e: f32,
    pub ec: f32,
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct NodePractical {
    pub theta: f32,
    pub theta_prev: f32,
    pub e: f32,
    pub ec: f32,
    pub alpha: f32,
    pub flags: u32,
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Edge {
    pub src: u32,
    pub dst: u32,
    pub weight: f32,
}
