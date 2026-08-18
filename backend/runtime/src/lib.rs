pub mod module_api;

use rts_core::{Node, Edge, step_sparse_buffered};
pub use module_api::OnsourModule;

/// A parallel execution domain (Island) for processing graph-based stochastic networks.
pub struct Island {
    pub current_state: Vec<Node>,
    pub next_state: Vec<Node>,
    pub edges: Vec<Edge>,
}

impl Island {
    pub fn new(num_nodes: usize, edges: Vec<Edge>) -> Self {
        let current_state = vec![Node::default(); num_nodes];
        let next_state = vec![Node::default(); num_nodes];
        Self { current_state, next_state, edges }
    }

    /// Executes one epoch using the Two-Phase Gather/Apply mechanism.
    pub fn step(&mut self) {
        step_sparse_buffered(&self.current_state, &mut self.next_state, &self.edges);
        
        // Double Buffering: Swap states for the next epoch
        std::mem::swap(&mut self.current_state, &mut self.next_state);
    }
}
