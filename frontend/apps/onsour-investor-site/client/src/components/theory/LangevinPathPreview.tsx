import { useEffect, useMemo, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { langevinTrajectory, THEORY_NUMERIC_MODE, THEORY_PREVIEW_ENGINE } from "./theoryMath";

const WIDTH = 760;
const HEIGHT = 300;
const DEFAULTS = { r: 1, u: 1, theta0: 0.05, dt: 0.02, noise: 0.25, steps: 48, seed: 42 };

export default function LangevinPathPreview() {
  const [parameters, setParameters] = useState(DEFAULTS);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  const trajectory = useMemo(() => langevinTrajectory(parameters), [parameters]);
  const minStep = 0;
  const maxStep = Math.max(parameters.steps, 1);
  const x = (step: number) => 42 + (step / maxStep) * 690;
  const y = (theta: number) => 34 + ((1 - theta) / 2) * 188;
  const path = trajectory.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.step).toFixed(2)},${y(point.theta).toFixed(2)}`).join(" ");
  const current = trajectory[trajectory.length - 1];

  const update = (key: keyof typeof parameters, value: string) => setParameters((currentParameters) => ({ ...currentParameters, [key]: Number(value) }));
  const newSeed = () => setParameters((currentParameters) => ({ ...currentParameters, seed: Math.floor(Math.random() * 9000) + 1 }));

  return (
    <section className={`theory-observatory-panel ${reducedMotion ? "is-reduced-motion" : ""}`} aria-labelledby="langevin-preview-title" data-motion-mode={reducedMotion ? "static" : "interactive"}>
      <div className="theory-panel-heading">
        <div>
          <span className="theory-panel-index">04 / STOCHASTIC PATH</span>
          <h3 id="langevin-preview-title">Replay a noisy trajectory</h3>
          <p>The deterministic drift pulls θ down the potential gradient while a seeded noise term perturbs the path. Same seed, same educational replay.</p>
        </div>
        <span className="theory-status-badge amber-badge"><span className="theory-status-dot" /> BROWSER PREVIEW / STOCHASTIC</span>
      </div>

      <div className="langevin-layout">
        <div className="langevin-chart-column">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="theory-chart-svg" role="img" aria-labelledby="langevin-chart-title langevin-chart-desc">
            <title id="langevin-chart-title">Seeded Langevin trajectory preview</title>
            <desc id="langevin-chart-desc">A bounded trajectory of theta over discrete preview steps, generated from a seeded browser-only noise source.</desc>
            <g className="theory-grid-lines"><line x1="42" x2="712" y1={y(0)} y2={y(0)} /><line x1="42" x2="712" y1={y(1)} y2={y(1)} /><line x1="42" x2="712" y1={y(-1)} y2={y(-1)} /></g>
            <line className="theory-axis-line" x1="42" x2="712" y1={y(0)} y2={y(0)} /><line className="theory-axis-line" x1="42" x2="42" y1="34" y2="222" />
            {trajectory.length > 0 && <path className="langevin-curve" d={path} />}
            {current && <><circle className="phase-marker-halo" cx={x(current.step)} cy={y(current.theta)} r="14" /><circle className="phase-marker" cx={x(current.step)} cy={y(current.theta)} r="5" /></>}
            <text className="theory-axis-label" x="716" y="245">step</text><text className="theory-axis-label" x="12" y="40">θ</text>
            <text className="theory-axis-tick" x="42" y="252">0</text><text className="theory-axis-tick" x="712" y="252" textAnchor="end">{parameters.steps}</text>
            <text className="theory-axis-tick" x="29" y={y(1) + 4} textAnchor="end">+1</text><text className="theory-axis-tick" x="29" y={y(0) + 4} textAnchor="end">0</text><text className="theory-axis-tick" x="29" y={y(-1) + 4} textAnchor="end">−1</text>
          </svg>
          <div className="theory-chart-caption"><code>dθ/dt = −∂V/∂θ + η(t)</code><span>seed {parameters.seed}</span></div>
        </div>
        <div className="theory-control-stack langevin-controls">
          <Control label="noise intensity" value={parameters.noise} min={0} max={0.8} step={0.01} onChange={(value) => update("noise", value)} />
          <Control label="time step dt" value={parameters.dt} min={0.005} max={0.08} step={0.005} onChange={(value) => update("dt", value)} />
          <Control label="initial θ" value={parameters.theta0} min={-1} max={1} step={0.05} onChange={(value) => update("theta0", value)} />
          <div className="tanh-output-readout"><span>FINAL θ</span><strong>{current?.theta.toFixed(3) ?? "—"}</strong><span>DRIFT / NOISE</span><strong>{current ? `${current.drift.toFixed(3)} / ${current.noise.toFixed(3)}` : "—"}</strong></div>
          <div className="theory-button-row"><button type="button" className="theory-reset-button" onClick={() => setParameters((currentParameters) => ({ ...currentParameters }))}><RotateCcw size={14} /> Replay same seed</button><button type="button" className="theory-reset-button" onClick={newSeed}><Dices size={14} /> New seed</button></div>
          <p className="theory-microcopy">Seeded browser illustration only · no claim of hardware RNG parity with Rust. Motion mode: {reducedMotion ? "static (reduced motion)" : "interactive"}.</p>
          <p className="theory-microcopy">{THEORY_PREVIEW_ENGINE} · {THEORY_NUMERIC_MODE}</p>
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: string) => void }) {
  return <label className="theory-control-row"><span><b>{label}</b><output>{value.toFixed(3)}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
