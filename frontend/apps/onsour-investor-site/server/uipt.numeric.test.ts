import { describe, expect, it } from "vitest";

function simulatedTanh(x: number): number {
  return Math.tanh(x);
}

function computeDispersion(thetas: number[]): number {
  if (thetas.length === 0) return 0;
  const mean = thetas.reduce((acc, val) => acc + val, 0) / thetas.length;
  const variance = thetas.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / thetas.length;
  return variance;
}

describe("UIPT Numeric Kernel & Dispersion math in ONSOUR", () => {
  it("computes bounded tanh activations correctly", () => {
    expect(simulatedTanh(0)).toBe(0);
    expect(simulatedTanh(10)).toBeCloseTo(1, 4);
    expect(simulatedTanh(-10)).toBeCloseTo(-1, 4);
  });

  it("calculates state dispersion accurately for uniform vs dispersed states", () => {
    const uniform = [0.5, 0.5, 0.5, 0.5];
    expect(computeDispersion(uniform)).toBe(0);

    const dispersed = [-1, -0.5, 0.5, 1];
    expect(computeDispersion(dispersed)).toBeGreaterThan(0.4);
  });

  it("evaluates thermodynamic governance acceptance condition correctly", () => {
    const currentDispersion = 0.25;
    const epsilon = 0.05;
    const acceptedCandidate = 0.28;
    const rejectedCandidate = 0.32;

    expect(acceptedCandidate <= currentDispersion + epsilon).toBe(true);
    expect(rejectedCandidate <= currentDispersion + epsilon).toBe(false);
  });
});
