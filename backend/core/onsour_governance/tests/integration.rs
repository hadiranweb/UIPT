use onsour_governance::{ThermodynamicGovernor, SystemMetrics, from_fixed};
use std::time::Duration;

#[test]
fn test_governance_clamping_logic() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    
    // Test 1: Ideal conditions (multiple steps to settle EMA)
    let metrics_ideal = SystemMetrics::new(0.0, 0.0, 0.0);
    let mut last_eps = 0;
    for _ in 0..20 {
        last_eps = governor.compute_dynamic_epsilon(&metrics_ideal, Duration::from_secs(10));
    }
    let last_eps_f = from_fixed(last_eps);
    assert!(last_eps_f > 0.095 && last_eps_f <= 0.1, "Ideal eps should be close to base, got {}", last_eps_f);

    // Test 2: Extreme Load (Saturation)
    let metrics_stressed = SystemMetrics::new(1.0, 1.0, 500.0);
    let mut stressed_eps = 0;
    for _ in 0..30 {
        stressed_eps = governor.compute_dynamic_epsilon(&metrics_stressed, Duration::from_secs(10));
    }
    
    let stressed_eps_f = from_fixed(stressed_eps);
    assert!(stressed_eps_f < 0.05);
    assert!(stressed_eps >= governor.min_epsilon);
}

#[test]
fn test_governance_nominal() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0);
    let mut eps = 0;
    for _ in 0..20 {
        eps = governor.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
    }
    let eps_f = from_fixed(eps);
    // nominal epsilon should be around 0.0727
    assert!((eps_f - 0.0727).abs() < 0.001, "Nominal eps was {}, expected ~0.0727", eps_f);
}
