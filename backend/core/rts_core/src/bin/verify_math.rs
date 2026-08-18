use rts_core::{Node, Edge, step_sparse_buffered};
use serde::{Serialize, Deserialize};
use std::io::{self, Read};

#[derive(Serialize, Deserialize)]
struct TestInput {
    nodes: Vec<Node>,
    edges: Vec<Edge>,
    steps: usize,
}

#[derive(Serialize, Deserialize)]
struct TestOutput {
    final_nodes: Vec<Node>,
}

fn main() {
    let mut input_str = String::new();
    io::stdin().read_to_string(&mut input_str).unwrap();
    let input: TestInput = serde_json::from_str(&input_str).unwrap();

    let mut current = input.nodes;
    let mut next = vec![Node::default(); current.len()];

    for _ in 0..input.steps {
        step_sparse_buffered(&current, &mut next, &input.edges);
        std::mem::swap(&mut current, &mut next);
    }

    let output = TestOutput { final_nodes: current };
    println!("{}", serde_json::to_string(&output).unwrap());
}
