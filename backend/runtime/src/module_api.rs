use rts_core::state::Fixed64;

/// The standard interface for any module (Island) to plug into the ONSOUR Level 1 Infrastructure.
pub trait OnsourModule: Send + Sync {
    /// Returns the unique identifier of the module.
    fn id(&self) -> &str;

    /// Initializes the module with its specific stochastic parameters.
    fn init(&mut self);

    /// Executed during the Synaptic Hub convergence phase.
    fn on_converge(&mut self, global_state: &[Fixed64]);

    /// Executed during every execution epoch.
    fn update(&mut self, dt: Fixed64);

    /// Sets the dynamic entropy threshold (epsilon) for the module.
    fn set_epsilon(&mut self, epsilon: Fixed64);

    /// Returns the cryptographic root of the current state.
    fn get_state_root(&self) -> String;

    /// Returns the context summary for the current epoch.
    fn get_context_summary(&self) -> String;
}
