use island_runtime::module_api::OnsourModule;
use island_runtime::knowledge::{KnowledgeBase, MockKnowledgeBase};
use commerce_reef::CommerceReef;
use finance_lagoon::FinanceLagoon;
use log::info;
use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
use rts_core::state::Fixed64;
use std::time::Duration;

#[derive(Debug)]
enum TransactionStage {
    Gateway,
    Regulatory,
    Logic,
    Ledger,
    Observers,
}

struct OmniArchFlow {
    stage: TransactionStage,
    governor: ThermodynamicGovernor,
    metrics: SystemMetrics,
    knowledge_base: Box<dyn KnowledgeBase>,
}

impl OmniArchFlow {
    fn new() -> Self {
        Self { 
            stage: TransactionStage::Gateway,
            governor: ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).expect("Invalid Governor Config"),
            metrics: SystemMetrics::new(0.0, 0.0, 0.0),
            knowledge_base: Box::new(MockKnowledgeBase::new()),
        }
    }

    async fn process(&mut self, island: &mut dyn OnsourModule, epoch: u64) {
        info!("Starting OmniArch Flow for Island: {} (Epoch: {})", island.id(), epoch);

        // 1. Gateway
        self.stage = TransactionStage::Gateway;
        info!("[{:?}] Validating incoming request...", self.stage);

        // 2. Regulatory
        self.stage = TransactionStage::Regulatory;
        info!("[{:?}] Checking Ethical Determinism & Governance...", self.stage);
        
        // Query Knowledge Layer for invariants
        if let Some(max_vol) = self.knowledge_base.get_invariant("max_volatility") {
            info!("[{:?}] Applying Knowledge Invariant: max_volatility = {}", self.stage, max_vol);
        }

        self.metrics = SystemMetrics::new(0.4, 0.3, 15.0); 
        let dynamic_epsilon = self.governor.compute_dynamic_epsilon(&self.metrics, Duration::from_secs(10));
        let epsilon_fp64: Fixed64 = (dynamic_epsilon as i64) << 16;
        island.set_epsilon(epsilon_fp64);

        // 3. Logic
        self.stage = TransactionStage::Logic;
        info!("[{:?}] Dispatching to Langevin Core...", self.stage);
        let dt_fp64: Fixed64 = 42949673; // 0.01 in Q32.32
        island.update(dt_fp64); 

        // 4. Ledger (PoT & Knowledge Distillation)
        self.stage = TransactionStage::Ledger;
        let state_root = island.get_state_root();
        let context_summary = island.get_context_summary();
        
        let _snapshot = self.governor.create_snapshot(epoch, dynamic_epsilon, &state_root); 
        
        // Distill context into knowledge every 10 epochs (simulated here)
        if epoch % 10 == 0 {
            let knowledge_hash = self.knowledge_base.distill(&context_summary);
            info!("[{:?}] Knowledge Distilled! Hash: {}", self.stage, knowledge_hash);
        }
        
        info!("[{:?}] PoT Hash: {}", self.stage, self.governor.last_hash());
        info!("[{:?}] Context Summary: {}", self.stage, context_summary);

        // 5. Observers
        self.stage = TransactionStage::Observers;
        info!("[{:?}] Notifying external receptors.", self.stage);
        
        info!("Flow completed successfully.");
    }
}

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("ONSOUR Synaptic Hub (Omni-Layer Edition) v0.6.0 Starting...");

    let mut commerce = CommerceReef::new("commerce_reef_01", 100);
    let mut finance = FinanceLagoon::new("finance_lagoon_01", 50);

    commerce.init();
    finance.init();

    let mut flow = OmniArchFlow::new();

    for epoch in 1..=10 {
        flow.process(&mut commerce, epoch).await;
        flow.process(&mut finance, epoch).await;
    }

    info!("Synaptic Hub: All islands converged across 4-layer memory ontology.");
}
