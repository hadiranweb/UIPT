use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

/// Q32.32 Fixed-point for high-precision Langevin dynamics.
pub type Fixed64 = i64;
pub const FP_SHIFT_64: u32 = 32;
pub const FP_ONE_64: Fixed64 = 1 << FP_SHIFT_64;

#[wasm_bindgen]
#[repr(C, align(16))]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Node {
    pub theta: Fixed64,
    pub e: Fixed64,
    pub ec: Fixed64,
    #[serde(default)]
    pub _padding: u64, // Pad to 32 bytes total (8*3 + 8)
}

#[wasm_bindgen]
#[repr(C, align(16))]
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Edge {
    pub src: u32,
    pub dst: u32,
    pub weight: Fixed64,
    #[serde(default)]
    pub _padding: u64,
}

// Helper to convert float to Fixed64
pub fn to_fp64(f: f64) -> Fixed64 {
    (f * FP_ONE_64 as f64) as Fixed64
}

pub fn from_fp64(fp: Fixed64) -> f64 {
    fp as f64 / FP_ONE_64 as f64
}
