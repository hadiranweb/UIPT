use island_runtime::module_api::OnsourModule;
use commerce_reef::CommerceReef;
use finance_lagoon::FinanceLagoon;
use log::{info, warn, error};
use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
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
}

impl OmniArchFlow {
    fn new() -> Self {
        Self { 
            stage: TransactionStage::Gateway,
            governor: ThermodynamicGovernor::new(0.1, 0.005, 0.25),
            metrics: SystemMetrics::new(0.2), // EMA alpha = 0.2
        }
    }

    async fn process(&mut self, island: &mut dyn OnsourModule) {
        info!("Starting OmniArch Flow for Island: {}", island.id());

        // 1. Gateway
        self.stage = TransactionStage::Gateway;
        info!("[{:?}] Validating incoming request...", self.stage);

        // 2. Regulatory
        self.stage = TransactionStage::Regulatory;
        info!("[{:?}] Checking Ethical Determinism & Governance...", self.stage);
        
        // Mocking metrics update (In production, this would read from /proc/stat or OS APIs)
        self.metrics.update(0.4, 0.3, 15.0); 
        let dynamic_epsilon = self.governor.compute_dynamic_epsilon(&self.metrics);
        info!("[{:?}] Governance Applied: Epsilon set to {:.6}", self.stage, dynamic_epsilon);

        // 3. Logic
        self.stage = TransactionStage::Logic;
        info!("[{:?}] Dispatching to Langevin Core...", self.stage);
        island.update(0.01); // Simulate one epoch

        // 4. Ledger
        self.stage = TransactionStage::Ledger;
        info!("[{:?}] Committing state to Evidence Layer...", self.stage);

        // 5. Observers
        self.stage = TransactionStage::Observers;
        info!("[{:?}] Notifying external receptors.", self.stage);
        
        info!("Flow completed successfully.");
    }
}

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("ONSOUR Synaptic Hub (OmniArch Edition) v0.3.0 Starting...");

    // Initialize Islands
    let mut commerce = CommerceReef::new("commerce_reef_01", 100);
    let mut finance = FinanceLagoon::new("finance_lagoon_01", 50);

    commerce.init();
    finance.init();

    let mut flow = OmniArchFlow::new();

    // Process Commerce Island
    flow.process(&mut commerce).await;

    // Process Finance Island
    flow.process(&mut finance).await;

    info!("Synaptic Hub: All islands converged.");
}
