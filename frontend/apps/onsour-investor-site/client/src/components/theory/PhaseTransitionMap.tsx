import { useMemo, useState } from "react";
import { CircleDot, Sparkles, Zap } from "lucide-react";
import { classifyUiptPhase } from "./theoryMath";

const PRESETS = {
  classical: { label: "Classical", theta: 0.06, energy: 0.28, description: "Below the critical threshold: the state remains close to symmetric, reactive and bounded by the classical regime.", icon: CircleDot },
  critical: { label: "Critical", theta: 0.38, energy: 0.62, description: "At the edge of transition: small perturbations produce larger changes in the order parameter and the system is most susceptible to noise.", icon: Zap },
  agentic: { label: "Agentic", theta: 0.82, energy: 0.92, description: "A theoretical UIPT regime in which symmetry is broken and a distinct order-parameter branch is selected.", icon: Sparkles },
} as const;

type PresetKey = keyof typeof PRESETS;

export default function PhaseTransitionMap() {
  const [selected, setSelected] = useState<PresetKey>("critical");
  const preset = PRESETS[selected];
  const Icon = preset.icon;
  const derivedPhase = classifyUiptPhase(preset.energy, preset.theta);
  const marker = useMemo(() => ({ x: 52 + preset.energy * 358, y: 190 - preset.theta * 112 }), [preset]);

  return (
    <section className="theory-observatory-panel phase-map-panel" aria-labelledby="phase-map-title">
      <div className="theory-panel-heading">
        <div>
          <span className="theory-panel-index">02 / PHASE TRANSITION</span>
          <h3 id="phase-map-title">Locate the order parameter</h3>
          <p>Move through the three conceptual regimes and see how energy and θ describe a change in symmetry rather than a software feature toggle.</p>
        </div>
        <span className="theory-status-badge amber-badge"><span className="theory-status-dot" /> THEORY / UIPT-A</span>
      </div>

      <div className="phase-map-layout">
        <div className="phase-map-visual">
          <svg viewBox="0 0 470 270" className="theory-chart-svg" role="img" aria-labelledby="phase-map-svg-title phase-map-svg-desc">
            <title id="phase-map-svg-title">Conceptual UIPT phase transition map</title>
            <desc id="phase-map-svg-desc">A conceptual map from low to high relative energy and from symmetric to broken-symmetry order parameter.</desc>
            <defs>
              <linearGradient id="phase-gradient" x1="0" x2="1"><stop offset="0%" stopColor="#74f0e4" stopOpacity="0.12" /><stop offset="55%" stopColor="#f5b86b" stopOpacity="0.26" /><stop offset="100%" stopColor="#74f0e4" stopOpacity="0.08" /></linearGradient>
            </defs>
            <rect className="phase-map-field" x="52" y="32" width="358" height="158" rx="2" fill="url(#phase-gradient)" />
            <line className="theory-axis-line" x1="52" y1="190" x2="410" y2="190" />
            <line className="theory-axis-line" x1="52" y1="32" x2="52" y2="190" />
            <line className="phase-critical-line" x1="52" y1="120" x2="410" y2="120" />
            <text className="phase-label" x="57" y="113">critical boundary E₀</text>
            <path className="phase-branch" d="M 52 185 C 150 184, 198 170, 234 120 C 275 67, 330 48, 410 42" />
            <path className="phase-branch phase-branch-secondary" d="M 52 185 C 150 186, 198 200, 234 120 C 275 172, 330 184, 410 190" />
            <line className="phase-guide-line" x1={marker.x} x2={marker.x} y1="32" y2="190" />
            <line className="phase-guide-line" x1="52" x2={marker.x} y1={marker.y} y2={marker.y} />
            <circle className="phase-marker-halo" cx={marker.x} cy={marker.y} r="16" />
            <circle className="phase-marker" cx={marker.x} cy={marker.y} r="6" />
            <text className="theory-axis-label" x="413" y="207">E / E₀</text>
            <text className="theory-axis-label" x="10" y="36">θ</text>
            <text className="theory-axis-tick" x="52" y="216">symmetric</text>
            <text className="theory-axis-tick" x="352" y="216">broken</text>
            <text className="theory-axis-tick" x="250" y="244" textAnchor="middle">relative energy →</text>
          </svg>
          <div className="theory-chart-caption"><code>θ ∈ [−1, 1]</code><span>conceptual phase map</span></div>
        </div>

        <div className="phase-map-controls">
          <div className="phase-preset-list" role="tablist" aria-label="UIPT phase presets">
            {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
              const item = PRESETS[key];
              const PresetIcon = item.icon;
              return <button key={key} type="button" role="tab" aria-selected={selected === key} className={`phase-preset ${selected === key ? "is-selected" : ""}`} onClick={() => setSelected(key)}><PresetIcon size={15} /><span>{item.label}</span><small>θ {item.theta.toFixed(2)}</small></button>;
            })}
          </div>
          <div className="phase-description" aria-live="polite"><Icon size={18} /><p>{preset.description}</p></div>
          <div className="phase-readout"><span>SELECTED REGIME</span><strong>{preset.label.toUpperCase()}</strong><span>ORDER PARAMETER θ</span><strong className="phase-theta-value">{preset.theta.toFixed(2)}</strong><span>DERIVED PREVIEW PHASE</span><strong>{derivedPhase.toUpperCase()}</strong></div>
          <p className="theory-microcopy">“Quantum-Agentic” is a theoretical UIPT label here, not a claim that this browser page implements a quantum computer.</p>
        </div>
      </div>
    </section>
  );
}
