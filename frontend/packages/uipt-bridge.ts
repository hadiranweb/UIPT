/**
 * ONSOUR Ecosystem: UIPT Bridge (TypeScript Glue Code)
 * This module provides a clean interface to interact with the Tanh-Brain Rust WASM core.
 */

// These types should match the Rust definitions
export interface UIPTNode {
    theta: number;
    e: number;
    ec: number;
}

export interface UIPTRelation {
    src: number;
    dst: number;
    weight: number;
}

export class TanhBrainEngine {
    private wasmModule: any;

    constructor(wasmModule: any) {
        this.wasmModule = wasmModule;
    }

    /**
     * Perform a single mathematical step for a standalone node.
     */
    public stepNode(node: UIPTNode, neighborSum: number): number {
        return this.wasmModule.step_node_math(node.theta, node.e, node.ec, neighborSum);
    }

    /**
     * Compute the excitatory channel alpha from order parameter theta.
     */
    public getAlpha(theta: number): number {
        return this.wasmModule.alpha(theta);
    }

    /**
     * Execute a sparse graph update across multiple nodes and edges.
     * Uses optimized WASM implementation.
     */
    public updateGraph(nodes: UIPTNode[], edges: UIPTRelation[]): UIPTNode[] {
        // The step_sparse_js function in Rust handles Serde conversion
        return this.wasmModule.step_sparse_js(nodes, edges);
    }
}

/**
 * React Hook example for using Tanh-Brain in the frontend.
 */
export const useTanhBrain = (engine: TanhBrainEngine) => {
    const runSimulation = (initialNodes: UIPTNode[], relations: UIPTRelation[], steps: number) => {
        let currentNodes = [...initialNodes];
        const history: UIPTNode[][] = [currentNodes];

        for (let i = 0; i < steps; i++) {
            currentNodes = engine.updateGraph(currentNodes, relations);
            history.push(currentNodes);
        }

        return { finalState: currentNodes, history };
    };

    return { runSimulation };
};
