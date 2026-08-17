struct Ewma {
    alpha: f32,
    value: f32,
}

impl Ewma {
    fn new(alpha: f32) -> Self {
        Self { alpha, value: 0.0 }
    }
    fn update(&mut self, input: f32) {
        self.value = self.alpha * input + (1.0 - self.alpha) * self.value;
    }
}

struct Cusum {
    threshold: f32,
    drift: f32,
    sum: f32,
}

impl Cusum {
    fn new(threshold: f32, drift: f32) -> Self {
        Self { threshold, drift, sum: 0.0 }
    }
    fn update(&mut self, input: f32) -> bool {
        self.sum = (0.0f32).max(self.sum + input - self.drift);
        self.sum > self.threshold
    }
}

fn main() {
    let mut ewma = Ewma::new(0.1);
    let mut cusum = Cusum::new(5.0, 0.5);
    
    for i in 0..100 {
        ewma.update(i as f32);
        let alert = cusum.update(i as f32);
        if i % 20 == 0 {
            println!("Step {}: EWMA={}, CUSUM Alert={}", i, ewma.value, alert);
        }
    }
}
