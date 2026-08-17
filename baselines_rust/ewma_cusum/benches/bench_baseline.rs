use criterion::{criterion_group, criterion_main, Criterion};

struct Ewma {
    alpha: f32,
    value: f32,
}
impl Ewma {
    fn update(&mut self, input: f32) {
        self.value = self.alpha * input + (1.0 - self.alpha) * self.value;
    }
}

fn bench_ewma(c: &mut Criterion) {
    let mut ewma = Ewma { alpha: 0.1, value: 0.0 };
    c.bench_function("ewma_update", |b| b.iter(|| ewma.update(1.0)));
}

criterion_group!(benches, bench_ewma);
criterion_main!(benches);
