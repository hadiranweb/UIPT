import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { meanFieldInput, meanFieldTanh, THEORY_NUMERIC_MODE, THEORY_PREVIEW_ENGINE } from "./theoryMath";

const WIDTH = 760;
const HEIGHT = 300;
const DEFAULTS = { energyRatio: 0.2, coupling: 0.8, neighborTheta: 0.35 };

export default function TanhResponseExplorer() {
  const [parameters, setParameters] = useState(DEFAULTS);
  const input = meanFieldInput(parameters);
  const output = meanFieldTanh(parameters);
  const points = useMemo(() => Array.from({ length: 121 }, (_, index) => {
    const x = -3 + (index / 120) * 6;
    return { x, y: Math.tanh(x) };
  }), []);
  const mapX = (value: number) => 56 + ((value + 3) / 6) * 660;
  const mapY = (value: number) => 32 + ((1 - value) / 2) * 202;
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${mapX(point.x).toFixed(2)},${mapY(point.y).toFixed(2)}`).join(" ");
  const markerX = mapX(input);
  const markerY = mapY(output);

  const update = (key: keyof typeof parameters, value: string) => setParameters((current) => ({ ...current, [key]: Number(value) }));

  return (
    <section className="theory-observatory-panel" aria-labelledby="tanh-explorer-title">
      <div className="theory-panel-heading">
        <div>
          <span className="theory-panel-index">03 / MEAN-FIELD RESPONSE</span>
          <h3 id="tanh-explorer-title">Watch θ saturate</h3>
          <p>Energy and incoming coupling enter the mean-field response; tanh keeps the order parameter inside its physical preview domain.</p>
        </div>
        <span className="theory-status-badge"><span className="theory-status-dot" /> RUNTIME CONTRACT / PREVIEW</span>
      </div>

      <div className="tanh-explorer-layout">
        <div className="tanh-chart-column">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="theory-chart-svg tanh-chart" role="img" aria-labelledby="tanh-chart-title tanh-chart-desc">
            <title id="tanh-chart-title">Mean-field hyperbolic tangent response</title>
            <desc id="tanh-chart-desc">The tanh response from minus one to one with the current input and output marked.</desc>
            <rect className="tanh-saturation-band" x="56" y={mapY(1)} width="660" height={mapY(0.78) - mapY(1)} />
            <rect className="tanh-saturation-band tanh-saturation-low" x="56" y={mapY(-0.78)} width="660" height={mapY(-1) - mapY(-0.78)} />
            <g className="theory-grid-lines"><line x1="56" x2="716" y1={mapY(0)} y2={mapY(0)} /><line x1={mapX(0)} x2={mapX(0)} y1="32" y2="234" /></g>
            <path className="tanh-curve" d={path} />
            <line className="tanh-marker-line" x1={markerX} x2={markerX} y1={markerY} y2="234" />
            <line className="tanh-marker-line" x1="56" x2={markerX} y1={markerY} y2={markerY} />
            <circle className="phase-marker-halo" cx={markerX} cy={markerY} r="15" /><circle className="phase-marker" cx={markerX} cy={markerY} r="6" />
            <text className="theory-axis-label" x="718" y="252">input</text><text className="theory-axis-label" x="18" y="40">θ(t+1)</text>
            <text className="theory-axis-tick" x="56" y="263">−3</text><text className="theory-axis-tick" x="386" y="263" textAnchor="middle">0</text><text className="theory-axis-tick" x="716" y="263" textAnchor="end">+3</text>
          </svg>
          <div className="theory-chart-caption"><code>θ(t+1) = tanh(input)</code><span>output {output.toFixed(3)}</span></div>
        </div>
        <div className="theory-control-stack tanh-controls">
          <Control label="(E − E꜀) / E꜀" value={parameters.energyRatio} min={-2} max={2} step={0.05} onChange={(value) => update("energyRatio", value)} />
          <Control label="coupling J" value={parameters.coupling} min={-2} max={2} step={0.05} onChange={(value) => update("coupling", value)} />
          <Control label="neighbor θ" value={parameters.neighborTheta} min={-1} max={1} step={0.05} onChange={(value) => update("neighborTheta", value)} />
          <div className="tanh-output-readout"><span>MEAN-FIELD INPUT</span><strong>{input.toFixed(3)}</strong><span>NEXT ORDER PARAMETER</span><strong className="tanh-output-value">{output.toFixed(3)}</strong></div>
          <button type="button" className="theory-reset-button" onClick={() => setParameters(DEFAULTS)}><RotateCcw size={14} /> Reset response</button>
          <p className="theory-microcopy">Educational coupling preview · {THEORY_PREVIEW_ENGINE} · {THEORY_NUMERIC_MODE}</p>
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: string) => void }) {
  return <label className="theory-control-row"><span><b>{label}</b><output>{value.toFixed(2)}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
