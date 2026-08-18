use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
use std::time::Duration;

#[test]
fn test_governance_clamping_logic() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25).unwrap();
    
    // Test 1: Ideal conditions (multiple steps to settle EMA)
    let metrics_ideal = SystemMetrics::new(0.0, 0.0, 0.0);
    let mut last_eps = 0.0;
    for _ in 0..10 {
        last_eps = governor.compute_dynamic_epsilon(&metrics_ideal);
    }
    assert!(last_eps > 0.095 && last_eps <= 0.1, "Ideal eps should be close to base, got {}", last_eps);

    // Test 2: Extreme Load (Saturation)
    let metrics_stressed = SystemMetrics::new(1.0, 1.0, 500.0);
    let mut stressed_eps = 0.0;
    for _ in 0..20 {
        stressed_eps = governor.compute_dynamic_epsilon(&metrics_stressed);
    }
    
    // Should be significantly reduced, possibly hitting min_epsilon
    assert!(stressed_eps < 0.05);
    assert!(stressed_eps >= governor.min_epsilon);
    println!("Stressed Epsilon after 20 steps: {}", stressed_eps);
}

#[test]
fn test_invalid_telemetry_handling() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25).unwrap();
    
    // NaN metrics
    let metrics_nan = SystemMetrics {
        cpu_load: f32::NAN,
        memory_pressure: 0.5,
        network_latency_ms: 10.0,
        last_updated_at: std::time::Instant::now(),
    };
    
    let epsilon = governor.compute_dynamic_epsilon(&metrics_nan);
    assert_eq!(epsilon, governor.min_epsilon, "NaN metrics should trigger fail-safe min_epsilon");
}

#[test]
fn test_needs_refresh_logic() {
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0);
    assert!(!metrics.needs_refresh());
    
    // Wait for refresh window
    std::thread::sleep(Duration::from_millis(600));
    assert!(metrics.needs_refresh());
}
