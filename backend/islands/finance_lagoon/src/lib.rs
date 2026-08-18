use island_runtime::module_api::OnsourModule;
use island_runtime::Island;
use rts_core::{Node, Edge};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct FinanceLagoon {
    id: String,
    #[serde(skip)]
    island: Island,
}

impl FinanceLagoon {
    pub fn new(id: &str, asset_count: usize) -> Self {
        Self {
            id: id.to_string(),
            island: Island::new(asset_count, Vec::new()),
        }
    }
}

impl OnsourModule for FinanceLagoon {
    fn id(&self) -> &str { &self.id }

    fn init(&mut self) {
        println!("Island [{}] initialized for Risk Analysis.", self.id);
    }

    fn on_converge(&mut self, _global_state: &[f32]) { }

    fn update(&mut self, _dt: f32) {
        self.island.step();
    }

    fn get_state_root(&self) -> String {
        self.island.compute_state_root()
    }
}
