/// The standard interface for any module (Island) to plug into the ONSOUR Level 1 Infrastructure.
pub trait OnsourModule: Send + Sync {
    /// Returns the unique identifier of the module.
    fn id(&self) -> &str;

    /// Initializes the module with its specific stochastic parameters.
    fn init(&mut self);

    /// Executed during the Synaptic Hub convergence phase.
    fn on_converge(&mut self, global_state: &[f32]);

    /// Executed during every execution epoch.
    fn update(&mut self, dt: f32);

    /// Returns the cryptographic root of the current state.
    fn get_state_root(&self) -> String;
}
