use std::time::{Instant, Duration};
use serde::{Serialize, Deserialize};
use log::info;

/// SystemMetrics with timestamp and defensive clamping.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_load: f32,                    // Normalized 0.0 to 1.0
    pub memory_pressure: f32,            // Normalized 0.0 to 1.0
    pub network_latency_ms: f32,         // Milliseconds (must be >= 0)
    #[serde(skip, default = "Instant::now")]
    pub last_updated_at: Instant,        // Timestamp for refresh logic
}

impl SystemMetrics {
    /// Create new metrics with current timestamp and defensive clamping.
    pub fn new(cpu_load: f32, memory_pressure: f32, network_latency_ms: f32) -> Self {
        // DEFENSIVE: Clamp inputs to valid ranges and handle NaN/Inf
        let cpu_load = if cpu_load.is_finite() { cpu_load.clamp(0.0, 1.0) } else { 1.0 };
        let memory_pressure = if memory_pressure.is_finite() { memory_pressure.clamp(0.0, 1.0) } else { 1.0 };
        let network_latency_ms = if network_latency_ms.is_finite() { network_latency_ms.max(0.0) } else { 1000.0 };
        
        SystemMetrics {
            cpu_load,
            memory_pressure,
            network_latency_ms,
            last_updated_at: Instant::now(),
        }
    }

    /// Check if metrics need refresh (older than 500ms)
    pub fn needs_refresh(&self) -> bool {
        self.last_updated_at.elapsed() > Duration::from_millis(500)
    }
}

/// The Thermodynamic Governor adjusts simulation entropy (epsilon) based on system load.
pub struct ThermodynamicGovernor {
    pub base_epsilon: f32,   // Default: 0.1
    pub min_epsilon: f32,    // Default: 0.005
    pub max_epsilon: f32,    // Default: 0.25
    
    // Exponential Moving Average coefficients for smoothing
    ema_alpha: f32,          // Default: 0.3 (30% new, 70% old)
    smoothed_load_factor: f32,
    smoothed_latency_factor: f32,
}

impl ThermodynamicGovernor {
    /// Create a new governor with strict validation.
    pub fn new(base: f32, min: f32, max: f32) -> Result<Self, &'static str> {
        if !base.is_finite() || !min.is_finite() || !max.is_finite() {
            return Err("Epsilon values must be finite");
        }

        if min <= 0.0 || min > base || base > max {
            return Err("Expected 0 < min_epsilon <= base_epsilon <= max_epsilon");
        }

        Ok(ThermodynamicGovernor {
            base_epsilon: base,
            min_epsilon: min,
            max_epsilon: max,
            ema_alpha: 0.3,
            smoothed_load_factor: 0.0,
            smoothed_latency_factor: 0.0,
        })
    }

    /// Computes dynamic epsilon with full safety guards and EMA smoothing.
    pub fn compute_dynamic_epsilon(&mut self, metrics: &SystemMetrics) -> f32 {
        // Fail-safe on invalid telemetry
        if !metrics.cpu_load.is_finite() || !metrics.memory_pressure.is_finite() || !metrics.network_latency_ms.is_finite() {
            return self.min_epsilon;
        }

        // 1. Compute raw factors
        let raw_load = (0.5 * metrics.cpu_load + 0.5 * metrics.memory_pressure).clamp(0.0, 1.0);
        let raw_latency = (metrics.network_latency_ms / 100.0).clamp(0.0, 2.0);

        // 2. Apply exponential smoothing (EMA)
        self.smoothed_load_factor = 
            self.ema_alpha * raw_load + (1.0 - self.ema_alpha) * self.smoothed_load_factor;
        self.smoothed_latency_factor = 
            self.ema_alpha * raw_latency + (1.0 - self.ema_alpha) * self.smoothed_latency_factor;

        // 3. Compute adjusted epsilon with guards
        let numerator = (1.0 - 0.4 * self.smoothed_load_factor).clamp(0.1, 1.0);
        let denominator = (1.0 + 0.2 * self.smoothed_latency_factor).clamp(0.5, f32::INFINITY);

        let adjusted = self.base_epsilon * (numerator / denominator);
        
        // 4. Final clamp to architectural bounds
        let final_epsilon = adjusted.clamp(self.min_epsilon, self.max_epsilon);
        
        info!("Dynamic Governance: Epsilon adjusted to {:.6} (Smoothed Load: {:.2}, Latency: {:.2})", 
              final_epsilon, self.smoothed_load_factor, self.smoothed_latency_factor);
              
        final_epsilon
    }

    /// Diagnostic helper to see calculation breakdown.
    pub fn compute_dynamic_epsilon_debug(&mut self, metrics: &SystemMetrics) -> (f32, String) {
        let final_eps = self.compute_dynamic_epsilon(metrics);
        let debug_info = format!(
            "load_factor(smoothed)={:.4}, latency_factor(smoothed)={:.4}, final_epsilon={:.6}",
            self.smoothed_load_factor, self.smoothed_latency_factor, final_eps
        );
        (final_eps, debug_info)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metrics_defensive_clamping() {
        let m = SystemMetrics::new(-0.5, 1.5, -10.0);
        assert_eq!(m.cpu_load, 0.0);
        assert_eq!(m.memory_pressure, 1.0);
        assert_eq!(m.network_latency_ms, 0.0);
    }

    #[test]
    fn test_governor_validation() {
        assert!(ThermodynamicGovernor::new(0.1, 0.2, 0.3).is_err());
        assert!(ThermodynamicGovernor::new(0.1, 0.05, 0.08).is_err());
        assert!(ThermodynamicGovernor::new(f32::NAN, 0.005, 0.25).is_err());
    }

    #[test]
    fn test_normal_conditions_tolerance() {
        let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25).unwrap();
        let metrics = SystemMetrics::new(0.2, 0.2, 10.0);
        
        let epsilon = gov.compute_dynamic_epsilon(&metrics);
        
        // After one update with EMA=0.3:
        // load_smoothed = 0.3 * 0.2 + 0.7 * 0.0 = 0.06
        // latency_smoothed = 0.3 * 0.1 + 0.7 * 0.0 = 0.03
        // eps = 0.1 * (1 - 0.4*0.06) / (1 + 0.2*0.03)
        // eps = 0.1 * 0.976 / 1.006 = 0.097017...
        assert!((epsilon - 0.097).abs() < 0.001, "Got {:.6}", epsilon);
    }

    #[test]
    fn test_exponential_smoothing_stability() {
        let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25).unwrap();
        
        let spike = SystemMetrics::new(1.0, 1.0, 400.0);
        let e1 = gov.compute_dynamic_epsilon(&spike);
        
        let normal = SystemMetrics::new(0.1, 0.1, 10.0);
        let e2 = gov.compute_dynamic_epsilon(&normal);
        
        assert!(e2 > e1, "Recovery from spike should show gradual increase");
    }
}
