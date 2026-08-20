use rts_core::{Node, Edge, step_sparse_buffered};
use rts_core::state::to_fp64;
use rayon::ThreadPoolBuilder;

#[test]
fn test_strict_multithread_determinism() {
    let n = 1000;
    let mut current_nodes = vec![Node::default(); n];
    for i in 0..n {
        current_nodes[i] = Node {
            theta: to_fp64((i as f64 * 0.01).sin()),
            e: to_fp64(12.0),
            ec: to_fp64(10.0),
            _padding: 0,
        };
    }

    let mut edges = Vec::new();
    for i in 0..n {
        edges.push(Edge { src: i as u32, dst: ((i + 1) % n) as u32, weight: to_fp64(0.1), _padding: 0 });
        edges.push(Edge { src: i as u32, dst: ((i + 7) % n) as u32, weight: to_fp64(0.05), _padding: 0 });
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

    for i in 0..n {
        assert_eq!(next_1[i].theta, next_8[i].theta, "Bit-exact mismatch at index {} (1 vs 8 threads)", i);
    }
    
    println!("Strict bit-exact determinism verified across threads.");
}
