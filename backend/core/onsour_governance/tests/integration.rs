use onsour_governance::{ThermodynamicGovernor, SystemMetrics};
use std::time::Duration;

#[test]
fn test_governance_clamping_logic() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    
    // Test 1: Ideal conditions (multiple steps to settle EMA)
    let metrics_ideal = SystemMetrics::new(0.0, 0.0, 0.0);
    let mut last_eps = 0.0;
    for _ in 0..20 {
        last_eps = governor.compute_dynamic_epsilon(&metrics_ideal, Duration::from_secs(10));
    }
    assert!(last_eps > 0.095 && last_eps <= 0.1, "Ideal eps should be close to base, got {}", last_eps);

    // Test 2: Extreme Load (Saturation)
    let metrics_stressed = SystemMetrics::new(1.0, 1.0, 500.0);
    let mut stressed_eps = 0.0;
    for _ in 0..30 {
        stressed_eps = governor.compute_dynamic_epsilon(&metrics_stressed, Duration::from_secs(10));
    }
    
    // Should be significantly reduced, hitting min_epsilon due to clamp(0.0, 2.0) on latency
    assert!(stressed_eps < 0.05);
    assert!(stressed_eps >= governor.min_epsilon);
}

#[test]
fn test_invalid_telemetry_handling() {
    let mut governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    
    // NaN metrics
    let metrics_nan = SystemMetrics {
        cpu_load: f32::NAN,
        memory_pressure: 0.5,
        network_latency_ms: 10.0,
        last_updated_at: std::time::Instant::now(),
    };
    
    // The new logic handles staleness but NaN is checked inside compute_dynamic_epsilon via metrics.is_stale?
    // Actually SystemMetrics::new handles NaN, but if someone manually constructs it:
    let epsilon = governor.compute_dynamic_epsilon(&metrics_nan, Duration::from_secs(10));
    // Since metrics_nan has NaN, compute_dynamic_epsilon will trigger fail-safe inside.
    assert!(epsilon >= governor.min_epsilon);
}

#[test]
fn test_is_stale_logic() {
    let metrics = SystemMetrics::new(0.5, 0.5, 50.0);
    assert!(!metrics.is_stale(Duration::from_millis(500)));
    
    // Wait for refresh window
    std::thread::sleep(Duration::from_millis(600));
    assert!(metrics.is_stale(Duration::from_millis(500)));
}
