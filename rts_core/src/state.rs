#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Node {
    pub theta: f32,
    pub e: f32,
    pub ec: f32,
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct NodePractical {
    pub theta: f32,
    pub theta_prev: f32,
    pub e: f32,
    pub ec: f32,
    pub alpha: f32,
    pub flags: u32,
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Edge {
    pub src: u32,
    pub dst: u32,
    pub weight: f32,
}
