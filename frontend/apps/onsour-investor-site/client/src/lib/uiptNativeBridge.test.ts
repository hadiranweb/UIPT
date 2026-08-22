import { describe, it, expect } from "vitest";
import { executeUiptStepDeterministic } from "./uiptNativeBridge";

describe("UIPT Native Bridge / Deterministic Engine Fallback", () => {
  it("executes sparse buffered step correctly and returns timing metrics", () => {
    const nodes = [
      { theta: 0.5, e: 0.1, ec: 1.0 },
      { theta: -0.2, e: 0.1, ec: 1.0 },
    ];
    const edges = [
      { src: 0, dst: 1, weight: 0.8 },
      { src: 1, dst: 0, weight: -0.5 },
    ];

    const result = executeUiptStepDeterministic(nodes, edges);

    expect(result.nodes).toHaveLength(2);
    expect(typeof result.elapsedMs).toBe("number");
    expect(result.elapsedMs).toBeGreaterThan(0);
    expect(result.engineVersion).toBe("ONSOUR-WASM-FIXED-v0.4.0");
    expect(result.numericMode).toBe("Q32.32_FIXED_JS_FALLBACK");
    expect(Math.abs(result.nodes[0].theta)).toBeLessThanOrEqual(1.0);
    expect(Math.abs(result.nodes[1].theta)).toBeLessThanOrEqual(1.0);
  });
});
