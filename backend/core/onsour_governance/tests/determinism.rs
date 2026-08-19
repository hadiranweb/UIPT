use onsour_governance::{ThermodynamicGovernor, SystemMetrics, to_fixed, Fixed};
use std::time::Duration;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct DeterminismTestVector {
    base: f32,
    min: f32,
    max: f32,
    alpha: f32,
    metrics: Vec<(f32, f32, f32)>, // cpu, mem, latency
    expected_epsilons: Vec<Fixed>,
}

#[test]
fn test_governance_fixed_point_determinism() {
    // This test uses a hardcoded set of metrics and checks against predefined fixed-point results.
    // Since it's fixed-point, these results MUST be identical on x86_64, ARM, and WASM.
    
    let base = 0.1;
    let min = 0.005;
    let max = 0.25;
    let alpha = 0.3;
    
    let mut gov = ThermodynamicGovernor::new(base, min, max, alpha).unwrap();
    
    // Test vectors: (cpu, mem, latency)
    let scenarios = vec![
        (0.1, 0.1, 5.0),   // Idle
        (0.5, 0.5, 50.0),  // Nominal
        (0.9, 0.9, 200.0), // Stressed
        (0.0, 1.0, 10.0),  // Asymmetric load
    ];

    let mut results = Vec::new();
    for (cpu, mem, lat) in scenarios {
        let metrics = SystemMetrics::new(cpu, mem, lat);
        // Run multiple times to let EMA stabilize
        let mut eps = 0;
        for _ in 0..10 {
            eps = gov.compute_dynamic_epsilon_wasm(&metrics, 10000);
        }
        results.push(eps);
    }

    // These values were captured from a verified run. 
    // Any deviation indicates a loss of cross-arch determinism.
    let expected = vec![6238, 4804, 3036, 5059];
    
    println!("Computed Epsilons: {:?}", results);
    assert_eq!(results, expected, "Fixed-point governance output diverged from reference!");
}

#[test]
fn test_pot_hash_determinism() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0);
    let eps = gov.compute_dynamic_epsilon_wasm(&metrics, 10000);
    
    let state_root = "d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2";
    let snapshot = gov.create_snapshot_wasm(1, eps, state_root);
    
    let hash = snapshot.compute_hash(state_root);
    let expected_hash = "a683e909cfec4e67f1e4ae3fdb5b206780590307fa9413db0ad5831901178321";
    
    assert_eq!(hash, expected_hash, "PoT Hash diverged! Cryptographic determinism failed.");
    println!("PoT Hash Verified: {}", hash);
}
