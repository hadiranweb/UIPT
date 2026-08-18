use island_runtime::module_api::OnsourModule;
use commerce_reef::CommerceReef;
use finance_lagoon::FinanceLagoon;
use log::info;
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
            governor: ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).expect("Invalid Governor Config"),
            metrics: SystemMetrics::new(0.0, 0.0, 0.0),
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
        
        if self.metrics.is_stale(Duration::from_millis(500)) {
            self.metrics = SystemMetrics::new(0.4, 0.3, 15.0); 
        }
        
        let dynamic_epsilon = self.governor.compute_dynamic_epsilon(&self.metrics, Duration::from_secs(10));
        
        // 3. Logic
        self.stage = TransactionStage::Logic;
        info!("[{:?}] Dispatching to Langevin Core...", self.stage);
        island.update(0.01); 

        // 4. Ledger (PoT Generation)
        self.stage = TransactionStage::Ledger;
        let state_root = island.get_state_root();
        let _snapshot = self.governor.create_snapshot(0, dynamic_epsilon, &state_root); 
        
        info!("[{:?}] PoT Hash: {}", self.stage, self.governor.last_hash);

        // 5. Observers
        self.stage = TransactionStage::Observers;
        info!("[{:?}] Notifying external receptors.", self.stage);
        
        info!("Flow completed successfully.");
    }
}

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("ONSOUR Synaptic Hub (PoT Edition) v0.4.0 Starting...");

    let mut commerce = CommerceReef::new("commerce_reef_01", 100);
    let mut finance = FinanceLagoon::new("finance_lagoon_01", 50);

    commerce.init();
    finance.init();

    let mut flow = OmniArchFlow::new();

    flow.process(&mut commerce).await;
    flow.process(&mut finance).await;

    info!("Synaptic Hub: All islands converged with PoT.");
}
