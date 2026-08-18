use wasm_bindgen::prelude::*;
use crate::state::{Node, Fixed64, FP_SHIFT_64, FP_ONE_64};

/// Deterministic Fixed-point multiplication for Q32.32
#[inline]
pub fn fp_mul(a: Fixed64, b: Fixed64) -> Fixed64 {
    ((a as i128 * b as i128) >> FP_SHIFT_64) as Fixed64
}

/// Deterministic Fixed-point division for Q32.32
#[inline]
pub fn fp_div(a: Fixed64, b: Fixed64) -> Fixed64 {
    if b == 0 { return 0; }
    (((a as i128) << FP_SHIFT_64) / b as i128) as Fixed64
}

/// A deterministic approximation of tanh(x) for Fixed-point.
pub fn fixed_tanh(x: Fixed64) -> Fixed64 {
    let abs_x = x.abs();
    if abs_x >= 4 * FP_ONE_64 {
        return if x > 0 { FP_ONE_64 } else { -FP_ONE_64 };
    }
    
    let x2 = fp_mul(x, x);
    let twenty_seven = 27 * FP_ONE_64;
    let nine = 9 * FP_ONE_64;
    
    let num = fp_mul(x, twenty_seven + x2);
    let den = twenty_seven + fp_mul(nine, x2);
    
    fp_div(num, den)
}

#[wasm_bindgen]
pub fn step_node_math_fixed(_theta: Fixed64, e: Fixed64, ec: Fixed64, neighbor_sum: Fixed64) -> Fixed64 {
    let raw = if ec == 0 {
        neighbor_sum
    } else {
        let term = fp_div(e - ec, ec);
        term + neighbor_sum
    };
    
    fixed_tanh(raw)
}

pub fn step_node_fixed(node: &mut Node, neighbor_sum: Fixed64) -> Fixed64 {
    node.theta = step_node_math_fixed(node.theta, node.e, node.ec, neighbor_sum);
    node.theta
}

#[wasm_bindgen]
pub fn alpha_fixed(theta: Fixed64) -> Fixed64 {
    (theta + FP_ONE_64) / 2
}
