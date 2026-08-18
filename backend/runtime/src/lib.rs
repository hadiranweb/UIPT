pub mod module_api;

use rts_core::{Node, Edge, step_sparse_buffered};
pub use module_api::OnsourModule;

/// A parallel execution domain (Island) for processing graph-based stochastic networks.
/// Enhanced with Rollback capability for Thermodynamic Governance.
pub struct Island {
    pub current_state: Vec<Node>,
    pub next_state: Vec<Node>,
    pub backup_state: Vec<Node>, // Used for deterministic rollback
    pub edges: Vec<Edge>,
}

impl Island {
    pub fn new(num_nodes: usize, edges: Vec<Edge>) -> Self {
        let current_state = vec![Node::default(); num_nodes];
        let next_state = vec![Node::default(); num_nodes];
        let backup_state = vec![Node::default(); num_nodes];
        Self { 
            current_state, 
            next_state, 
            backup_state,
            edges 
        }
    }

    /// Executes one epoch using the Two-Phase Gather/Apply mechanism.
    pub fn step(&mut self) {
        // 1. Snapshot current state before update
        self.backup_state.copy_from_slice(&self.current_state);

        // 2. Compute next state
        step_sparse_buffered(&self.current_state, &mut self.next_state, &self.edges);
        
        // 3. Double Buffering: Swap states for the next epoch
        std::mem::swap(&mut self.current_state, &mut self.next_state);
    }

    /// Rollback the island to the previous state.
    /// This is a deterministic O(N) operation.
    pub fn rollback(&mut self) {
        self.current_state.copy_from_slice(&self.backup_state);
    }
}
