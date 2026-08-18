use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
use std::time::Duration;

#[test]
fn test_governance_clamping_logic() {
    let governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25);
    let mut metrics = SystemMetrics::new(0.5); // EMA alpha = 0.5

    // Test 1: Ideal conditions
    metrics.update(0.0, 0.0, 1.0); // Low load, low latency
    let eps_ideal = governor.compute_dynamic_epsilon(&metrics);
    assert!(eps_ideal > 0.08 && eps_ideal < 0.11);

    // Test 2: Extreme Load (Saturation)
    metrics.update(2.0, 2.0, 500.0); // Oversaturated load, high latency
    let eps_stressed = governor.compute_dynamic_epsilon(&metrics);
    
    // Should be significantly reduced
    assert!(eps_stressed < eps_ideal);
    assert!(eps_stressed >= governor.min_epsilon);
    println!("Stressed Epsilon: {} (Reduced & Safe)", eps_stressed);

    // Test 3: Recovery via EMA
    // After one "good" update, EMA should gradually bring epsilon back
    metrics.update(0.0, 0.0, 1.0);
    let eps_recovery = governor.compute_dynamic_epsilon(&metrics);
    assert!(eps_recovery > eps_stressed);
    println!("Recovery Epsilon: {} (Increasing via EMA)", eps_recovery);
}

#[test]
fn test_division_safety_guard() {
    let governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25);
    let mut metrics = SystemMetrics::new(1.0);
    
    // Simulate zero latency (potential division by zero if not guarded)
    metrics.update(0.5, 0.5, 0.0);
    let epsilon = governor.compute_dynamic_epsilon(&metrics);
    
    assert!(epsilon.is_finite());
    assert!(epsilon > 0.0);
    println!("Zero Latency Epsilon: {} (Safe)", epsilon);
}
