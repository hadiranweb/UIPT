use criterion::{black_box, criterion_group, criterion_main, Criterion};
use onsour_governance::{ThermodynamicGovernor, SystemMetrics};

fn bench_governance_calculation(c: &mut Criterion) {
    let governor = ThermodynamicGovernor::new(0.1, 0.005, 0.25);
    let mut metrics = SystemMetrics::new(0.2);
    metrics.update(0.5, 0.4, 20.0);

    c.bench_function("compute_dynamic_epsilon", |b| {
        b.iter(|| {
            governor.compute_dynamic_epsilon(black_box(&metrics))
        })
    });
}

fn bench_metrics_update(c: &mut Criterion) {
    let mut metrics = SystemMetrics::new(0.2);

    c.bench_function("metrics_ema_update", |b| {
        b.iter(|| {
            metrics.update(black_box(0.6), black_box(0.5), black_box(30.0))
        })
    });
}

criterion_group!(benches, bench_governance_calculation, bench_metrics_update);
criterion_main!(benches);
