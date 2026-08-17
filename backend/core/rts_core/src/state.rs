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

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct StochasticState {
    pub x: f64,
    pub r: f64,
    pub d: f64,
}

impl StochasticState {
    pub fn new(r: f64, d: f64) -> Self {
        Self { x: 0.0, r, d }
    }
    
    pub fn step(&mut self, dt: f64, eta: f64) {
        let force = 2.0 * self.r * self.x - 4.0 * self.x.powi(3);
        let stochastic = (2.0 * self.d * dt).sqrt() * eta;
        self.x += force * dt + stochastic;
    }
    
    pub fn omega(&self) -> f64 {
        2.0 * self.r.sqrt()
    }
}
