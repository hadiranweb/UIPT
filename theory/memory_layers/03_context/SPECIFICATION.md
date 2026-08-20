# Layer 03: Context Memory (The Memory Reef)

## 1. Functional Definition
The **Context Layer** represents the immediate relational environment of an ONSOUR agent. Unlike the Operational layer, which deals with raw numbers, the Context layer maintains the "meaning" of recent state transitions. It acts as a temporal buffer that allows the system to recognize patterns and maintain continuity across multiple epochs.

## 2. Technical Requirements
- **Deterministic State Retention:** Every state stored in the Context layer must be derived from a verified `GovernanceSnapshot`.
- **Relational Mapping:** The Context layer must map mathematical states to semantic identifiers (e.g., mapping a node's theta value to a specific "Confidence" or "Risk" metric).
- **Time-Bounded Decay:** To prevent memory bloat, the Context layer implements a deterministic decay function, where older relational data is either distilled into the Knowledge layer or discarded.

## 3. Integration with Island Runtime
The Island runtime will be extended to include a `ContextBuffer`. This buffer will store the last $N$ states of the island, allowing the `update` function to make decisions based on historical trajectories rather than just the immediate prior state. This is crucial for implementing advanced Langevin dynamics that exhibit memory-dependent behavior.
