use std::time::{Instant, Duration};
use serde::{Serialize, Deserialize};
use log::info;

/// Represents system health metrics used for dynamic epsilon adjustment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_load: f32,              // EMA over recent window (0.0 to 1.0+)
    pub memory_pressure: f32,       // Pressure stall information (0.0 to 1.0)
    pub network_latency_ms: f32,    // 95th percentile of recent RTT
    #[serde(skip, default = "Instant::now")]
    pub last_updated_at: Instant,
    pub ema_alpha: f32,             // Smoothing factor for EMA
}

impl SystemMetrics {
    pub fn new(ema_alpha: f32) -> Self {
        Self {
            cpu_load: 0.0,
            memory_pressure: 0.0,
            network_latency_ms: 0.0,
            last_updated_at: Instant::now(),
            ema_alpha,
        }
    }

    /// Checks if metrics should be refreshed based on a cooldown period.
    pub fn should_refresh(&self, cooldown: Duration) -> bool {
        self.last_updated_at.elapsed() > cooldown
    }

    /// Updates metrics using Exponential Moving Average (EMA) to prevent jitter.
    pub fn update(&mut self, new_cpu: f32, new_mem: f32, new_latency: f32) {
        self.cpu_load = (self.ema_alpha * new_cpu) + (1.0 - self.ema_alpha) * self.cpu_load;
        self.memory_pressure = (self.ema_alpha * new_mem) + (1.0 - self.ema_alpha) * self.memory_pressure;
        self.network_latency_ms = (self.ema_alpha * new_latency) + (1.0 - self.ema_alpha) * self.network_latency_ms;
        self.last_updated_at = Instant::now();
    }
}

/// The Thermodynamic Governor adjusts simulation entropy (epsilon) based on system load.
pub struct ThermodynamicGovernor {
    pub base_epsilon: f32,
    pub min_epsilon: f32,
    pub max_epsilon: f32,
}

impl ThermodynamicGovernor {
    pub fn new(base: f32, min: f32, max: f32) -> Self {
        Self {
            base_epsilon: base,
            min_epsilon: min,
            max_epsilon: max,
        }
    }

    /// Computes dynamic epsilon with safety guards to prevent negative values or division errors.
    /// Formula: epsilon = clamp(base * (1.0 - 0.4 * load) / (1.0 + 0.2 * latency), min, max)
    pub fn compute_dynamic_epsilon(&self, metrics: &SystemMetrics) -> f32 {
        // 1. Calculate Load Factor (CPU + Memory) and clamp to [0.0, 1.0]
        let load_factor = (0.5 * metrics.cpu_load + 0.5 * metrics.memory_pressure).clamp(0.0, 1.0);
        
        // 2. Calculate Latency Factor (normalized by 100ms) and clamp to prevent excessive reduction
        let latency_factor = (metrics.network_latency_ms / 100.0).clamp(0.0, 2.0);
        
        // 3. Apply Safety Guards to Numerator and Denominator
        // Prevents epsilon from becoming negative even if load_factor is high
        let numerator = (1.0 - 0.4 * load_factor).max(0.1); 
        // Prevents division by zero or very small numbers
        let denominator = (1.0 + 0.2 * latency_factor).max(0.5); 
        
        let adjusted = self.base_epsilon * (numerator / denominator);
        
        // 4. Final clamp to architectural bounds
        let final_epsilon = adjusted.clamp(self.min_epsilon, self.max_epsilon);
        
        info!("Dynamic Governance: Epsilon adjusted to {:.6} (Load: {:.2}, Latency: {:.2}ms)", 
              final_epsilon, load_factor, metrics.network_latency_ms);
              
        final_epsilon
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normal_metrics_with_tolerance() {
        let governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25);
        let mut metrics = SystemMetrics::new(1.0); // No smoothing for test
        metrics.update(0.2, 0.2, 10.0);
        
        let epsilon = governor.compute_dynamic_epsilon(&metrics);
        
        // Expected: 0.1 * (1.0 - 0.4*0.2) / (1.0 + 0.2*(10/100))
        // = 0.1 * (0.92) / (1.02) = 0.090196...
        let expected = 0.090196;
        assert!((epsilon - expected).abs() < 0.0001, "Expected ~{}, got {}", expected, epsilon);
    }

    #[test]
    fn test_high_load_safety() {
        let governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25);
        let mut metrics = SystemMetrics::new(1.0);
        metrics.update(5.0, 5.0, 500.0); // Extremely stressed
        
        let epsilon = governor.compute_dynamic_epsilon(&metrics);
        
        // Even with high load, it should not go below min_epsilon
        assert!(epsilon >= governor.min_epsilon);
        assert!(epsilon > 0.0);
    }
}
