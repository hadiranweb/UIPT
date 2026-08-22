export type PotentialParameters = {
  r: number;
  u: number;
  thetaMin: number;
  thetaMax: number;
  samples?: number;
};

export type PotentialPoint = { theta: number; value: number };
export type PotentialMinimum = { theta: number; value: number };

export type TanhParameters = {
  energyRatio: number;
  coupling: number;
  neighborTheta: number;
};

export type LangevinParameters = {
  r: number;
  u: number;
  theta0: number;
  dt: number;
  noise: number;
  steps: number;
  seed: number;
};

export type LangevinPoint = { step: number; theta: number; drift: number; noise: number };
export type UiptPhase = "classical" | "critical" | "agentic";

export const THEORY_NUMERIC_MODE = "browser-f64-preview" as const;
export const THEORY_PREVIEW_ENGINE = "educational-preview" as const;
export const THEORY_SCHEMA_VERSION = "uipt-theory-v1" as const;

export function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** UIPT Landau-Ginzburg double-well potential: V(theta) = -r theta^2 + u theta^4. */
export function landauGinzburgPotential(theta: number, r: number, u: number) {
  return -r * theta ** 2 + u * theta ** 4;
}

/** First derivative dV/dtheta = -2r theta + 4u theta^3. */
export function landauGinzburgGradient(theta: number, r: number, u: number) {
  return -2 * r * theta + 4 * u * theta ** 3;
}

/** Deterministic equilibrium candidates in the safe quartic regime u > 0. */
export function potentialMinima(r: number, u: number): PotentialMinimum[] {
  if (!isFiniteNumber(r) || !isFiniteNumber(u) || u <= 0) return [];
  const candidates = r > 0 ? [-Math.sqrt(r / (2 * u)), 0, Math.sqrt(r / (2 * u))] : [0];
  const minima = candidates.filter((theta) => -2 * r + 12 * u * theta ** 2 > 0);
  return minima.map((theta) => ({ theta, value: landauGinzburgPotential(theta, r, u) }));
}

export function samplePotential({ r, u, thetaMin, thetaMax, samples = 161 }: PotentialParameters): PotentialPoint[] {
  if (!isFiniteNumber(r) || !isFiniteNumber(u) || u <= 0 || !isFiniteNumber(thetaMin) || !isFiniteNumber(thetaMax) || thetaMax <= thetaMin) return [];
  const count = Math.max(2, Math.floor(samples));
  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1);
    const theta = thetaMin + (thetaMax - thetaMin) * ratio;
    return { theta, value: landauGinzburgPotential(theta, r, u) };
  });
}

export function meanFieldInput({ energyRatio, coupling, neighborTheta }: TanhParameters) {
  return energyRatio + coupling * neighborTheta;
}

/** Educational phase classifier for the Theory page; it is not a runtime governance decision. */
export function classifyUiptPhase(energyRatio: number, theta: number): UiptPhase {
  if (!isFiniteNumber(energyRatio) || !isFiniteNumber(theta)) return "critical";
  const energy = Math.abs(energyRatio);
  const order = Math.abs(theta);
  if (energy < 0.45 && order < 0.2) return "classical";
  if (energy < 0.8 || order < 0.6) return "critical";
  return "agentic";
}

export function meanFieldTanh(parameters: TanhParameters) {
  return clamp(Math.tanh(meanFieldInput(parameters)), -1, 1);
}

/** Small deterministic PRNG for replayable browser-only educational trajectories. */
export function seededRandom(seed: number) {
  let state = (Math.floor(seed) >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function langevinTrajectory(parameters: LangevinParameters): LangevinPoint[] {
  const { r, u, theta0, dt, noise, steps, seed } = parameters;
  if (![r, u, theta0, dt, noise, steps, seed].every(isFiniteNumber) || u <= 0 || dt <= 0 || noise < 0 || steps < 1) return [];
  const random = seededRandom(seed);
  const trajectory: LangevinPoint[] = [{ step: 0, theta: clamp(theta0, -1, 1), drift: 0, noise: 0 }];
  for (let step = 1; step <= Math.floor(steps); step += 1) {
    const current = trajectory[trajectory.length - 1].theta;
    const drift = -landauGinzburgGradient(current, r, u);
    const stochastic = (random() * 2 - 1) * noise * Math.sqrt(dt);
    const theta = clamp(current + drift * dt + stochastic, -1, 1);
    trajectory.push({ step, theta, drift, noise: stochastic });
  }
  return trajectory;
}

export function pathRange(points: Array<{ theta: number }>) {
  if (!points.length) return { min: -1, max: 1 };
  const values = points.map((point) => point.theta);
  const min = Math.min(-1, ...values);
  const max = Math.max(1, ...values);
  return { min, max };
}
