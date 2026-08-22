import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { landauGinzburgPotential, potentialMinima, samplePotential, THEORY_NUMERIC_MODE, THEORY_PREVIEW_ENGINE, THEORY_SCHEMA_VERSION } from "./theoryMath";

const WIDTH = 760;
const HEIGHT = 330;
const MARGIN = { top: 24, right: 24, bottom: 48, left: 54 };
const DEFAULTS = { r: 1, u: 1, thetaMin: -1.5, thetaMax: 1.5 };

function format(value: number) {
  return value.toFixed(3);
}

export default function InteractivePotentialExplorer() {
  const [parameters, setParameters] = useState(DEFAULTS);
  const points = useMemo(() => samplePotential({ ...parameters, samples: 181 }), [parameters]);
  const minima = useMemo(() => potentialMinima(parameters.r, parameters.u).filter((point) => point.theta >= parameters.thetaMin && point.theta <= parameters.thetaMax), [parameters]);
  const valid = points.length > 0;
  const valueMin = valid ? Math.min(...points.map((point) => point.value), 0) : -1;
  const valueMax = valid ? Math.max(...points.map((point) => point.value), 1) : 1;
  const x = (theta: number) => MARGIN.left + ((theta - parameters.thetaMin) / (parameters.thetaMax - parameters.thetaMin)) * (WIDTH - MARGIN.left - MARGIN.right);
  const y = (value: number) => HEIGHT - MARGIN.bottom - ((value - valueMin) / (valueMax - valueMin || 1)) * (HEIGHT - MARGIN.top - MARGIN.bottom);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.theta).toFixed(2)},${y(point.value).toFixed(2)}`).join(" ");
  const stateLabel = !valid ? "INVALID QUARTIC REGIME" : minima.length === 2 ? "SYMMETRY BROKEN / DOUBLE WELL" : "CRITICAL OR SINGLE WELL";

  const update = (key: keyof typeof parameters, value: string) => {
    setParameters((current) => ({ ...current, [key]: Number(value) }));
  };

  return (
    <section className="theory-observatory-panel" aria-labelledby="potential-explorer-title">
      <div className="theory-panel-heading">
        <div>
          <span className="theory-panel-index">01 / POTENTIAL LANDSCAPE</span>
          <h3 id="potential-explorer-title">Feel the symmetry break</h3>
          <p>Adjust the Landau–Ginzburg coefficients and watch the effective free-energy landscape move from a central well to two stable identities.</p>
        </div>
        <span className="theory-status-badge"><span className="theory-status-dot" /> THEORY + BROWSER PREVIEW</span>
      </div>

      <div className="theory-explorer-grid">
        <div className="theory-chart-wrap">
          <svg className="theory-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="potential-chart-title potential-chart-desc">
            <title id="potential-chart-title">Landau-Ginzburg potential curve</title>
            <desc id="potential-chart-desc">A graph of V theta equals negative r theta squared plus u theta to the fourth, with minima marked in amber.</desc>
            <g className="theory-grid-lines">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => <line key={`h-${ratio}`} x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={MARGIN.top + ratio * (HEIGHT - MARGIN.top - MARGIN.bottom)} y2={MARGIN.top + ratio * (HEIGHT - MARGIN.top - MARGIN.bottom)} />)}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => <line key={`v-${ratio}`} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} x1={MARGIN.left + ratio * (WIDTH - MARGIN.left - MARGIN.right)} x2={MARGIN.left + ratio * (WIDTH - MARGIN.left - MARGIN.right)} />)}
            </g>
            <line className="theory-axis-line" x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={HEIGHT - MARGIN.bottom} y2={HEIGHT - MARGIN.bottom} />
            <line className="theory-axis-line" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} />
            {valid && <path className="potential-curve" d={path} />}
            {minima.map((minimum) => <g key={minimum.theta} className="potential-minimum"><circle cx={x(minimum.theta)} cy={y(minimum.value)} r="6" /><circle cx={x(minimum.theta)} cy={y(minimum.value)} r="13" /></g>)}
            <text className="theory-axis-label" x={WIDTH - MARGIN.right - 12} y={HEIGHT - 16}>θ</text>
            <text className="theory-axis-label" x={16} y={MARGIN.top + 8}>V(θ)</text>
            <text className="theory-axis-tick" x={MARGIN.left - 8} y={HEIGHT - MARGIN.bottom + 25} textAnchor="end">{parameters.thetaMin.toFixed(1)}</text>
            <text className="theory-axis-tick" x={WIDTH / 2} y={HEIGHT - MARGIN.bottom + 25} textAnchor="middle">0</text>
            <text className="theory-axis-tick" x={WIDTH - MARGIN.right + 8} y={HEIGHT - MARGIN.bottom + 25}>{parameters.thetaMax.toFixed(1)}</text>
          </svg>
          <div className="theory-chart-caption"><code>V(θ) = −rθ² + uθ⁴</code><span>{stateLabel}</span></div>
        </div>

        <div className="theory-control-stack">
          <Control label="r · symmetry-breaking drive" value={parameters.r} min={-1} max={2} step={0.05} onChange={(value) => update("r", value)} />
          <Control label="u · stabilizing quartic term" value={parameters.u} min={0.1} max={2} step={0.05} onChange={(value) => update("u", value)} />
          <div className="theory-readout-grid">
            <div><span>MINIMA</span><strong>{valid ? minima.length : "—"}</strong></div>
            <div><span>V(0)</span><strong>{valid ? format(landauGinzburgPotential(0, parameters.r, parameters.u)) : "—"}</strong></div>
            <div><span>θ* ±</span><strong>{minima.length === 2 ? `±${format(Math.abs(minima[1].theta))}` : "—"}</strong></div>
            <div><span>u CHECK</span><strong className={parameters.u > 0 ? "readout-good" : "readout-warn"}>{parameters.u > 0 ? "SAFE" : "INVALID"}</strong></div>
          </div>
          <button type="button" className="theory-reset-button" onClick={() => setParameters(DEFAULTS)}><RotateCcw size={14} /> Reset critical baseline</button>
          <p className="theory-microcopy">{THEORY_PREVIEW_ENGINE} · {THEORY_NUMERIC_MODE} · {THEORY_SCHEMA_VERSION}</p>
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: string) => void }) {
  return (
    <label className="theory-control-row">
      <span><b>{label}</b><output>{value.toFixed(2)}</output></span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
