use onsour_governance::{ThermodynamicGovernor, SystemMetrics, to_fixed, FP_ONE};
use std::time::Duration;
use rand::Rng;

#[test]
fn test_chaos_spike_injection() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let mut metrics = SystemMetrics::new(0.1, 0.1, 5.0);
    let mut rng = rand::thread_rng();

    println!("Starting Chaos Test: Spike Injection (Fixed-Point)...");

    for i in 0..100 {
        if i % 20 == 0 {
            metrics = SystemMetrics::new(
                rng.gen_range(0.8..1.0), 
                rng.gen_range(0.7..0.9), 
                rng.gen_range(200.0..500.0)
            );
            println!("[Step {}] CHAOS INJECTED", i);
        } else {
            // Random walk in fixed point
            let cpu_delta = to_fixed(rng.gen_range(-0.05..0.05));
            metrics.cpu_load = (metrics.cpu_load + cpu_delta).clamp(0, FP_ONE);
        }

        let eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
        assert!(eps >= gov.min_epsilon && eps <= gov.max_epsilon);
    }
    println!("Chaos Test Passed.");
}

#[test]
fn test_stale_telemetry_recovery() {
    let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
    let metrics = SystemMetrics::new(0.1, 0.1, 5.0);
    
    let eps_normal = gov.compute_dynamic_epsilon(&metrics, Duration::from_secs(10));
    assert!(eps_normal > to_fixed(0.09));

    std::thread::sleep(Duration::from_millis(600));
    let eps_stale = gov.compute_dynamic_epsilon(&metrics, Duration::from_millis(500));
    
    assert_eq!(eps_stale, gov.min_epsilon);

    let fresh_metrics = SystemMetrics::new(0.1, 0.1, 5.0);
    let eps_recovered = gov.compute_dynamic_epsilon(&fresh_metrics, Duration::from_secs(10));
    
    assert!(eps_recovered > eps_stale);
}
