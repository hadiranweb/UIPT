use rts_core::{Node, Edge, step_sparse_buffered};
use rayon::ThreadPoolBuilder;

#[test]
fn test_strict_multithread_determinism() {
    let n = 10000;
    let mut current_nodes = vec![Node::default(); n];
    for i in 0..n {
        current_nodes[i] = Node {
            theta: (i as f32 * 0.01).sin(),
            e: 12.0,
            ec: 10.0,
            _padding: 0,
        };
    }

    let mut edges = Vec::new();
    for i in 0..n {
        edges.push(Edge { src: i as u32, dst: ((i + 1) % n) as u32, weight: 0.1, _padding: 0 });
        edges.push(Edge { src: i as u32, dst: ((i + 7) % n) as u32, weight: 0.05, _padding: 0 });
    }

    // Reference Run: 1 thread
    let pool_1 = ThreadPoolBuilder::new().num_threads(1).build().unwrap();
    let mut next_1 = vec![Node::default(); n];
    pool_1.install(|| {
        step_sparse_buffered(&current_nodes, &mut next_1, &edges);
    });

    // Test Run: 8 threads
    let pool_8 = ThreadPoolBuilder::new().num_threads(8).build().unwrap();
    let mut next_8 = vec![Node::default(); n];
    pool_8.install(|| {
        step_sparse_buffered(&current_nodes, &mut next_8, &edges);
    });

    // Test Run: 16 threads
    let pool_16 = ThreadPoolBuilder::new().num_threads(16).build().unwrap();
    let mut next_16 = vec![Node::default(); n];
    pool_16.install(|| {
        step_sparse_buffered(&current_nodes, &mut next_16, &edges);
    });

    for i in 0..n {
        let bits_1 = next_1[i].theta.to_bits();
        let bits_8 = next_8[i].theta.to_bits();
        let bits_16 = next_16[i].theta.to_bits();

        assert_eq!(bits_1, bits_8, "Bit-exact mismatch at index {} (1 vs 8 threads)", i);
        assert_eq!(bits_1, bits_16, "Bit-exact mismatch at index {} (1 vs 16 threads)", i);
    }
    
    println!("Strict bit-exact determinism verified across 1, 8, and 16 threads.");
}
