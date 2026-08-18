use crate::state::{Node, Edge, Fixed64};
use crate::math::{step_node_math_fixed, fp_mul};
use rayon::prelude::*;

pub fn step_sparse_buffered(current_nodes: &[Node], next_nodes: &mut [Node], edges: &[Edge]) {
    let n = current_nodes.len();
    assert_eq!(n, next_nodes.len(), "Buffer size mismatch");
    
    // Deterministic Adjacency List
    let mut adjacency: Vec<Vec<(usize, Fixed64)>> = vec![vec![]; n];
    for edge in edges {
        let src = edge.src as usize;
        let dst = edge.dst as usize;
        if src < n && dst < n {
            adjacency[dst].push((src, edge.weight));
        }
    }

    // Parallel Gather
    let neighbor_sums: Vec<Fixed64> = (0..n)
        .into_par_iter()
        .map(|i| {
            let mut node_edges = adjacency[i].clone();
            node_edges.sort_by_key(|&(src, _)| src);
            
            node_edges.iter().fold(0, |acc, &(src, w)| {
                acc + fp_mul(current_nodes[src].theta, w)
            })
        })
        .collect();
    
    // Parallel Apply
    next_nodes.par_iter_mut().enumerate().for_each(|(i, node)| {
        node.theta = step_node_math_fixed(
            current_nodes[i].theta, 
            current_nodes[i].e, 
            current_nodes[i].ec, 
            neighbor_sums[i]
        );
        node.e = current_nodes[i].e;
        node.ec = current_nodes[i].ec;
    });
}

pub fn step_sparse_impl(nodes: &mut [Node], edges: &[Edge]) {
    let mut next_nodes = nodes.to_vec();
    step_sparse_buffered(nodes, &mut next_nodes, edges);
    nodes.copy_from_slice(&next_nodes);
}
