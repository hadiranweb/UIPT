use std::time::{Instant, Duration};
use serde::{Serialize, Deserialize};
use log::{info, warn};

/// A snapshot of governance state for a specific epoch to ensure exact replayability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceSnapshot {
    pub epoch: u64,
    pub epsilon: f32,
    pub smoothed_load: f32,
    pub smoothed_latency: f32,
    pub timestamp_unix: u64,
}

/// SystemMetrics with timestamp and defensive clamping.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_load: f32,                    // Normalized 0.0 to 1.0
    pub memory_pressure: f32,            // Normalized 0.0 to 1.0
    pub network_latency_ms: f32,         // Milliseconds (must be >= 0)
    #[serde(skip, default = "Instant::now")]
    pub last_updated_at: Instant,        // For runtime refresh logic only
}

impl SystemMetrics {
    pub fn new(cpu: f32, mem: f32, latency: f32) -> Self {
        SystemMetrics {
            cpu_load: if cpu.is_finite() { cpu.clamp(0.0, 1.0) } else { 1.0 },
            memory_pressure: if mem.is_finite() { mem.clamp(0.0, 1.0) } else { 1.0 },
            network_latency_ms: if latency.is_finite() { latency.max(0.0) } else { 1000.0 },
            last_updated_at: Instant::now(),
        }
    }

    pub fn is_stale(&self, max_age: Duration) -> bool {
        self.last_updated_at.elapsed() > max_age
    }
}

/// The Thermodynamic Governor adjusts simulation entropy (epsilon) based on system load.
pub struct ThermodynamicGovernor {
    pub base_epsilon: f32,
    pub min_epsilon: f32,
    pub max_epsilon: f32,
    
    ema_alpha: f32,          // Invariant: 0.0 < alpha <= 1.0
    smoothed_load: f32,
    smoothed_latency: f32,
}

impl ThermodynamicGovernor {
    pub fn new(base: f32, min: f32, max: f32, alpha: f32) -> Result<Self, &'static str> {
        if !base.is_finite() || !min.is_finite() || !max.is_finite() || !alpha.is_finite() {
            return Err("Parameters must be finite");
        }
        if min <= 0.0 || min > base || base > max {
            return Err("Expected 0 < min <= base <= max");
        }
        if alpha <= 0.0 || alpha > 1.0 {
            return Err("EMA alpha must be in (0.0, 1.0]");
        }

        Ok(Self {
            base_epsilon: base,
            min_epsilon: min,
            max_epsilon: max,
            ema_alpha: alpha,
            smoothed_load: 0.0,
            smoothed_latency: 0.0,
        })
    }

    pub fn compute_dynamic_epsilon(&mut self, metrics: &SystemMetrics, max_age: Duration) -> f32 {
        // Fail-safe on stale telemetry or NaN
        if metrics.is_stale(max_age) || !metrics.cpu_load.is_finite() || !metrics.memory_pressure.is_finite() || !metrics.network_latency_ms.is_finite() {
            warn!("Invalid or stale telemetry! Throttling to min_epsilon.");
            return self.min_epsilon;
        }

        // 1. Raw Factors
        let raw_load = (0.5 * metrics.cpu_load + 0.5 * metrics.memory_pressure).clamp(0.0, 1.0);
        let raw_latency = (metrics.network_latency_ms / 100.0).clamp(0.0, 2.0);

        // 2. EMA Update
        self.smoothed_load = self.ema_alpha * raw_load + (1.0 - self.ema_alpha) * self.smoothed_load;
        self.smoothed_latency = self.ema_alpha * raw_latency + (1.0 - self.ema_alpha) * self.smoothed_latency;

        // 3. Formula with Guards
        let num = (1.0 - 0.4 * self.smoothed_load).clamp(0.1, 1.0);
        let den = (1.0 + 0.2 * self.smoothed_latency).clamp(0.5, f32::INFINITY);

        let adjusted = self.base_epsilon * (num / den);
        adjusted.clamp(self.min_epsilon, self.max_epsilon)
    }

    pub fn create_snapshot(&self, epoch: u64, epsilon: f32) -> GovernanceSnapshot {
        GovernanceSnapshot {
            epoch,
            epsilon,
            smoothed_load: self.smoothed_load,
            smoothed_latency: self.smoothed_latency,
            timestamp_unix: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invariants() {
        assert!(ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).is_ok());
        assert!(ThermodynamicGovernor::new(0.1, 0.005, 0.25, 1.1).is_err());
    }

    #[test]
    fn test_staleness_policy() {
        let mut gov = ThermodynamicGovernor::new(0.1, 0.005, 0.25, 0.3).unwrap();
        let metrics = SystemMetrics::new(0.0, 0.0, 0.0);
        std::thread::sleep(Duration::from_millis(100));
        let eps = gov.compute_dynamic_epsilon(&metrics, Duration::from_millis(50));
        assert_eq!(eps, gov.min_epsilon);
    }
}
