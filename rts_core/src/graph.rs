use crate::state::{Node, Edge};
use crate::math::step_node_math;

pub fn step_sparse(nodes: &mut [Node], edges: &[Edge]) {
    let n = nodes.len();
    let mut neighbor_sums = vec![0.0; n];
    
    for edge in edges {
        let src = edge.src as usize;
        let dst = edge.dst as usize;
        if src < n && dst < n {
            neighbor_sums[dst] += edge.weight * nodes[src].theta;
        }
    }
    
    for i in 0..n {
        nodes[i].theta = step_node_math(nodes[i].theta, nodes[i].e, nodes[i].ec, neighbor_sums[i]);
    }
}
