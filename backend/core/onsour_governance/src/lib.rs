use std::time::{Instant, Duration};
use serde::{Serialize, Deserialize};
use log::warn;
use sha2::{Sha256, Digest};

/// Q16.16 Fixed-point representation for deterministic governance.
pub type Fixed = i32;
pub const FP_SHIFT: u32 = 16;
pub const FP_ONE: Fixed = 1 << FP_SHIFT;

pub fn to_fixed(f: f32) -> Fixed {
    (f * FP_ONE as f32) as Fixed
}

pub fn from_fixed(fixed: Fixed) -> f32 {
    fixed as f32 / FP_ONE as f32
}

/// A snapshot of governance state for a specific epoch.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceSnapshot {
    pub epoch: u64,
    pub epsilon: Fixed,
    pub smoothed_load: Fixed,
    pub smoothed_latency: Fixed,
    pub prev_hash: String, // Link to previous epoch for PoT
}

impl GovernanceSnapshot {
    /// Computes the cryptographic hash of the trajectory step.
    pub fn compute_hash(&self, state_root: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(self.epoch.to_le_bytes());
        hasher.update(self.epsilon.to_le_bytes());
        hasher.update(self.smoothed_load.to_le_bytes());
        hasher.update(self.smoothed_latency.to_le_bytes());
        hasher.update(self.prev_hash.as_bytes());
        hasher.update(state_root.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

/// SystemMetrics using Fixed-point for absolute determinism.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_load: Fixed,
    pub memory_pressure: Fixed,
    pub network_latency_ms: Fixed,
    #[serde(skip, default = "Instant::now")]
    pub last_updated_at: Instant,
}

impl SystemMetrics {
    pub fn new(cpu: f32, mem: f32, latency: f32) -> Self {
        SystemMetrics {
            cpu_load: to_fixed(cpu.clamp(0.0, 1.0)),
            memory_pressure: to_fixed(mem.clamp(0.0, 1.0)),
            network_latency_ms: to_fixed(latency.max(0.0)),
            last_updated_at: Instant::now(),
        }
    }

    pub fn is_stale(&self, max_age: Duration) -> bool {
        self.last_updated_at.elapsed() > max_age
    }
}

pub struct ThermodynamicGovernor {
    pub base_epsilon: Fixed,
    pub min_epsilon: Fixed,
    pub max_epsilon: Fixed,
    
    ema_alpha: Fixed,
    smoothed_load: Fixed,
    smoothed_latency: Fixed,
    pub last_hash: String,
}

impl ThermodynamicGovernor {
    pub fn new(base: f32, min: f32, max: f32, alpha: f32) -> Result<Self, &'static str> {
        let b = to_fixed(base);
        let mi = to_fixed(min);
        let ma = to_fixed(max);
        let a = to_fixed(alpha);

        if mi <= 0 || mi > b || b > ma {
            return Err("Expected 0 < min <= base <= max");
        }
        if a <= 0 || a > FP_ONE {
            return Err("EMA alpha must be in (0, 1]");
        }

        Ok(Self {
            base_epsilon: b,
            min_epsilon: mi,
            max_epsilon: ma,
            ema_alpha: a,
            smoothed_load: 0,
            smoothed_latency: 0,
            last_hash: "0".repeat(64),
        })
    }

    pub fn compute_dynamic_epsilon(&mut self, metrics: &SystemMetrics, max_age: Duration) -> Fixed {
        if metrics.is_stale(max_age) {
            warn!("Stale telemetry! Throttling to min_epsilon.");
            return self.min_epsilon;
        }

        let raw_load = (metrics.cpu_load + metrics.memory_pressure) / 2;
        let raw_load = raw_load.clamp(0, FP_ONE);

        let raw_latency = (metrics.network_latency_ms as i64 * FP_ONE as i64 / (100 * FP_ONE) as i64) as Fixed;
        let raw_latency = raw_latency.clamp(0, 2 * FP_ONE);

        let update_ema = |alpha: Fixed, raw: Fixed, smoothed: Fixed| -> Fixed {
            let term1 = (alpha as i64 * raw as i64) >> FP_SHIFT;
            let term2 = ((FP_ONE - alpha) as i64 * smoothed as i64) >> FP_SHIFT;
            (term1 + term2) as Fixed
        };

        self.smoothed_load = update_ema(self.ema_alpha, raw_load, self.smoothed_load);
        self.smoothed_latency = update_ema(self.ema_alpha, raw_latency, self.smoothed_latency);

        let f_04 = to_fixed(0.4);
        let f_02 = to_fixed(0.2);

        let num_term = (f_04 as i64 * self.smoothed_load as i64) >> FP_SHIFT;
        let numerator = (FP_ONE as i64 - num_term).clamp(to_fixed(0.1) as i64, FP_ONE as i64);

        let den_term = (f_02 as i64 * self.smoothed_latency as i64) >> FP_SHIFT;
        let denominator = (FP_ONE as i64 + den_term).clamp(to_fixed(0.5) as i64, i64::MAX);

        let adjusted = (self.base_epsilon as i64 * numerator / denominator) as Fixed;
        adjusted.clamp(self.min_epsilon, self.max_epsilon)
    }

    pub fn create_snapshot(&mut self, epoch: u64, epsilon: Fixed, state_root: &str) -> GovernanceSnapshot {
        let snapshot = GovernanceSnapshot {
            epoch,
            epsilon,
            smoothed_load: self.smoothed_load,
            smoothed_latency: self.smoothed_latency,
            prev_hash: self.last_hash.clone(),
        };
        self.last_hash = snapshot.compute_hash(state_root);
        snapshot
    }
}
