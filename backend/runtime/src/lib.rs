pub mod module_api;
pub mod knowledge;

use rts_core::{Node, Edge, step_sparse_buffered};
pub use module_api::OnsourModule;
use sha2::{Sha256, Digest};
use std::collections::VecDeque;

/// A parallel execution domain (Island) for processing graph-based stochastic networks.
/// Now includes a ContextBuffer for relational state retention (Layer 03).
pub struct Island {
    pub current_state: Vec<Node>,
    pub next_state: Vec<Node>,
    pub backup_state: Vec<Node>,
    pub edges: Vec<Edge>,
    /// Stores historical state roots for context-aware dynamics.
    pub context_history: VecDeque<String>,
    pub max_context_depth: usize,
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
            edges,
            context_history: VecDeque::with_capacity(10),
            max_context_depth: 10,
        }
    }

    pub fn step(&mut self) {
        self.backup_state.copy_from_slice(&self.current_state);
        step_sparse_buffered(&self.current_state, &mut self.next_state, &self.edges);
        std::mem::swap(&mut self.current_state, &mut self.next_state);
        
        // Record state root in context history
        let root = self.compute_state_root();
        if self.context_history.len() >= self.max_context_depth {
            self.context_history.pop_front();
        }
        self.context_history.push_back(root);
    }

    pub fn rollback(&mut self) {
        self.current_state.copy_from_slice(&self.backup_state);
        self.context_history.pop_back();
    }

    /// Updates the entropy threshold (ec) for all nodes in the island.
    pub fn set_epsilon(&mut self, epsilon: rts_core::state::Fixed64) {
        for node in &mut self.current_state {
            node.ec = epsilon;
        }
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

    /// Returns a summary of the current context history.
    pub fn get_context_summary(&self) -> String {
        let mut hasher = Sha256::new();
        for root in &self.context_history {
            hasher.update(root.as_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
}
