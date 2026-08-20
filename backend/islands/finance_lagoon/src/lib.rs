use island_runtime::module_api::OnsourModule;
use island_runtime::Island;
use rts_core::state::Fixed64;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct FinanceLagoon {
    id: String,
    #[serde(skip)]
    island: Island,
}

impl FinanceLagoon {
    pub fn new(id: &str, node_count: usize) -> Self {
        Self {
            id: id.to_string(),
            island: Island::new(node_count, Vec::new()),
        }
    }
}

impl OnsourModule for FinanceLagoon {
    fn id(&self) -> &str { &self.id }

    fn init(&mut self) {
        println!("Island [{}] initialized for Risk Analysis.", self.id);
    }

    fn on_converge(&mut self, _global_state: &[Fixed64]) { }

    fn update(&mut self, _dt: Fixed64) {
        self.island.step();
    }

    fn set_epsilon(&mut self, epsilon: Fixed64) {
        self.island.set_epsilon(epsilon);
    }

    fn get_state_root(&self) -> String {
        self.island.compute_state_root()
    }

    fn get_context_summary(&self) -> String {
        self.island.get_context_summary()
    }
}
