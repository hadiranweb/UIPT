import { describe, expect, it } from "vitest";
import {
  landauGinzburgGradient,
  landauGinzburgPotential,
  langevinTrajectory,
  meanFieldTanh,
  potentialMinima,
  samplePotential,
} from "./theoryMath";

describe("UIPT theory visualization math", () => {
  it("keeps the Landau-Ginzburg potential even around theta = 0", () => {
    expect(landauGinzburgPotential(-0.7, 1, 1)).toBeCloseTo(landauGinzburgPotential(0.7, 1, 1), 10);
    expect(landauGinzbergGradientSafely(-0.7)).toBeCloseTo(-landauGinzbergGradientSafely(0.7), 10);
  });

  it("finds the two symmetry-broken minima for positive r and u", () => {
    const minima = potentialMinima(1, 1);
    expect(minima).toHaveLength(2);
    expect(minima[0].theta).toBeCloseTo(-Math.sqrt(0.5), 8);
    expect(minima[1].theta).toBeCloseTo(Math.sqrt(0.5), 8);
  });

  it("rejects an unstable quartic coefficient and samples a valid curve", () => {
    expect(samplePotential({ r: 1, u: 0, thetaMin: -1, thetaMax: 1 })).toEqual([]);
    expect(samplePotential({ r: 1, u: 1, thetaMin: -1, thetaMax: 1, samples: 5 })).toHaveLength(5);
  });

  it("keeps mean-field output bounded in the order-parameter domain", () => {
    expect(meanFieldTanh({ energyRatio: 100, coupling: 20, neighborTheta: 1 })).toBe(1);
    expect(meanFieldTanh({ energyRatio: -100, coupling: 20, neighborTheta: -1 })).toBe(-1);
  });

  it("replays the same Langevin trajectory for the same seed", () => {
    const parameters = { r: 1, u: 1, theta0: 0.05, dt: 0.02, noise: 0.25, steps: 24, seed: 42 };
    expect(langevinTrajectory(parameters)).toEqual(langevinTrajectory(parameters));
    expect(langevinTrajectory({ ...parameters, seed: 43 })).not.toEqual(langevinTrajectory(parameters));
  });
});

function landauGinzbergGradientSafely(theta: number) {
  return landauGinzburgGradient(theta, 1, 1);
}
