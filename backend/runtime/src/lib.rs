pub mod module_api;

use rts_core::{Node, Edge, step_sparse_buffered};
pub use module_api::OnsourModule;
use sha2::{Sha256, Digest};

/// A parallel execution domain (Island) for processing graph-based stochastic networks.
pub struct Island {
    pub current_state: Vec<Node>,
    pub next_state: Vec<Node>,
    pub backup_state: Vec<Node>,
    pub edges: Vec<Edge>,
}

impl Default for Island {
    fn default() -> Self {
        Self::new(0, vec![])
    }
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

    pub fn step(&mut self) {
        self.backup_state.copy_from_slice(&self.current_state);
        step_sparse_buffered(&self.current_state, &mut self.next_state, &self.edges);
        std::mem::swap(&mut self.current_state, &mut self.next_state);
    }

    pub fn rollback(&mut self) {
        self.current_state.copy_from_slice(&self.backup_state);
    }

    /// Computes a deterministic hash of the current state for PoT.
    pub fn compute_state_root(&self) -> String {
        let mut hasher = Sha256::new();
        for node in &self.current_state {
            hasher.update(node.theta.to_le_bytes());
            hasher.update(node.e.to_le_bytes());
            hasher.update(node.ec.to_le_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
}
