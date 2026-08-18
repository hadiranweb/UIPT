use rts_core::{Node, Edge};
use island_runtime::Island;
use log::info;

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("Starting ONSOUR Synaptic Hub...");

    // Sample setup
    let num_nodes = 100;
    let edges = vec![
        Edge { src: 0, dst: 1, weight: 0.5, _padding: 0 },
        Edge { src: 1, dst: 0, weight: 0.3, _padding: 0 },
    ];

    let mut island = Island::new(num_nodes, edges);
    info!("Island initialized with {} nodes.", num_nodes);

    // Simulation loop
    for epoch in 0..10 {
        island.step();
        info!("Epoch {} completed. Node 0 theta: {:.4}", epoch, island.current_state[0].theta);
    }

    info!("ONSOUR Synaptic Hub shut down gracefully.");
}
