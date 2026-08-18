use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
use std::time::Duration;

#[test]
fn test_load_spike_loop_stability() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    
    // 1. Start with high load
    let mut metrics = SystemMetrics::new(0.9, 0.9, 300.0);
    let mut epsilon_history = Vec::new();

    // 2. Simulate 10 epochs under stress
    for _ in 0..10 {
        let eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
        epsilon_history.push(eps);
        
        // Mocking the feedback loop: 
        // In a real system, low epsilon might cause more rollbacks, increasing CPU load.
        // We simulate this by bumping the metrics slightly.
        metrics.cpu_load = (metrics.cpu_load + 0.05).min(1.0);
    }

    // 3. Verify that EMA prevented instantaneous collapse
    // Epsilon should decrease gradually, not immediately hit min_epsilon
    assert!(epsilon_history[0] > 0.05);
    assert!(epsilon_history[9] < epsilon_history[0]);
    
    println!("Epsilon History under stress: {:?}", epsilon_history);
}

#[test]
fn test_ema_convergence_steady_state() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0); // Nominal Stressed in Table

    let mut last_eps = 0.0;
    for _ in 0..50 {
        last_eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
    }

    // Steady state should match the corrected nominal value ~0.0727
    assert!((last_eps - 0.0727).abs() < 0.001, "Steady state was {}, expected 0.0727", last_eps);
}
