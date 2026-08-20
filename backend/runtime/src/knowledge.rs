use rts_core::state::Fixed64;
use sha2::{Sha256, Digest};

/// The Knowledge Layer (Layer 04) represents structural invariants and distilled truths.
/// This trait defines how islands interact with long-term semantic knowledge.
pub trait KnowledgeBase: Send + Sync {
    /// Returns a structural invariant for a given key.
    /// Invariants are returned as Fixed64 to maintain core engine determinism.
    fn get_invariant(&self, key: &str) -> Option<Fixed64>;

    /// Distills a context summary into a new structural truth.
    /// Returns a PoT-verifiable hash of the new knowledge entry.
    fn distill(&mut self, context_summary: &str) -> String;
}

/// A mock implementation of the Knowledge Base for Level 1.3 testing.
pub struct MockKnowledgeBase {
    invariants: std::collections::HashMap<String, Fixed64>,
}

impl MockKnowledgeBase {
    pub fn new() -> Self {
        let mut invariants = std::collections::HashMap::new();
        // 0.25 in Q32.32 = 1073741824
        invariants.insert("max_volatility".to_string(), 1073741824);
        Self { invariants }
    }
}

impl KnowledgeBase for MockKnowledgeBase {
    fn get_invariant(&self, key: &str) -> Option<Fixed64> {
        self.invariants.get(key).copied()
    }

    fn distill(&mut self, context_summary: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(b"KNOWLEDGE_DISTILLATION:");
        hasher.update(context_summary.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}
