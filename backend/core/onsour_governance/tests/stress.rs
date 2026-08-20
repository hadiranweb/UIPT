use onsour_governance::{ThermodynamicGovernor, SystemMetrics, from_fixed};
use std::time::Duration;

#[test]
fn test_load_spike_loop_stability() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    
    // 1. Start with high load
    let metrics = SystemMetrics::new(0.9, 0.9, 300.0);
    let mut epsilon_history = Vec::new();

    // 2. Simulate 10 epochs under stress
    for _ in 0..10 {
        let eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
        epsilon_history.push(from_fixed(eps));
    }

    // 3. Verify that EMA prevented instantaneous collapse
    assert!(epsilon_history[0] > 0.05);
    assert!(epsilon_history[9] < epsilon_history[0]);
    
    println!("Epsilon History under stress: {:?}", epsilon_history);
}

#[test]
fn test_ema_convergence_steady_state() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0);

    let mut last_eps = 0;
    for _ in 0..50 {
        last_eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
    }

    let last_eps_f = from_fixed(last_eps);
    assert!((last_eps_f - 0.0727).abs() < 0.001, "Steady state was {}, expected 0.0727", last_eps_f);
}
