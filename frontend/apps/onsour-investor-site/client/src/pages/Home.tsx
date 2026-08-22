/* Living Infrastructure direction: the page behaves like a calm scientific instrument—dark field, asymmetric editorial grid, cyan telemetry, amber intervention, and precise mechanism-first copy. */
import { useMemo, useState } from "react";
import { CapabilityMatrixShowcase } from "@/components/CapabilityMatrixShowcase";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { GlobalFooter } from "@/components/GlobalFooter";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Orbit,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Waves,
  Zap,
} from "lucide-react";

const heroImage = "/manus-storage/onsour-hero-reference_cb26e3f9.png";
const symbolImage = "/manus-storage/onsour-symbol_2ce6435f.png";

const flowSteps = [
  {
    id: "telemetry",
    label: "01 / TELEMETRY",
    title: "Read the environment",
    body: "CPU, memory, and network latency enter as bounded signals—not assumptions.",
    icon: Radio,
    accent: "cyan",
  },
  {
    id: "smooth",
    label: "02 / EMA",
    title: "Suppress the jitter",
    body: "A stateful EMA keeps transient spikes from becoming systemic decisions.",
    icon: Waves,
    accent: "cyan",
  },
  {
    id: "epsilon",
    label: "03 / GOVERN",
    title: "Tune the barrier",
    body: "Dynamic epsilon tightens under load and relaxes when the field is clear.",
    icon: Gauge,
    accent: "amber",
  },
  {
    id: "decision",
    label: "04 / DECISION",
    title: "Accept or return",
    body: "The kernel compares dispersion, then accepts the state—or restores the last stable buffer.",
    icon: ShieldCheck,
    accent: "amber",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <div className="section-kicker"><span className="kicker-dot" />{children}</div>;
}

function MetricChip({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "amber" }) {
  return (
    <div className={`metric-chip metric-chip-${tone}`}>
      <span className="metric-chip-label">{label}</span>
      <span className="metric-chip-value">{value}</span>
    </div>
  );
}

function HomeostasisLoop({ activeStep, setActiveStep }: { activeStep: number; setActiveStep: (index: number) => void }) {
  return (
    <div className="loop-stage">
      <div className="loop-orbit orbit-one" />
      <div className="loop-orbit orbit-two" />
      <div className="loop-core">
        <img src={symbolImage} alt="ONSOUR orbital loop mark" />
        <span>ONSOUR<br /><b>HOMEOSTASIS</b></span>
      </div>
      <div className="loop-node node-telemetry"><Radio size={15} /><span>Telemetry</span></div>
      <div className="loop-node node-ema"><Waves size={15} /><span>EMA</span></div>
      <div className="loop-node node-epsilon"><Gauge size={15} /><span>Epsilon</span></div>
      <div className="loop-node node-decision"><ShieldCheck size={15} /><span>Decision</span></div>
      <div className="loop-line line-a" />
      <div className="loop-line line-b" />
      <div className="loop-line line-c" />
      <div className="loop-line line-d" />
      <div className="loop-readout">
        <span className="mono-label">ACTIVE PHASE</span>
        <strong>{flowSteps[activeStep].label.split(" / ")[1]}</strong>
      </div>
    </div>
  );
}

export default function Home() {
  const [cpu, setCpu] = useState(0.42);
  const [memory, setMemory] = useState(0.36);
  const [latency, setLatency] = useState(42);
  const [activeStep, setActiveStep] = useState(0);
  const [showModel, setShowModel] = useState(false);

  const model = useMemo(() => {
    const load = clamp((cpu + memory) / 2, 0, 1);
    const latencyFactor = clamp(latency / 100, 0, 2);
    const epsilon = clamp(0.1 * (1 - 0.4 * load) / (1 + 0.2 * latencyFactor), 0.005, 0.25);
    const pressure = clamp(load * 0.7 + latencyFactor / 2 * 0.3, 0, 1);
    const posture = pressure > 0.64 ? "STRICT DEFENSE" : pressure > 0.36 ? "STANDARD REGULATION" : "EXPLORATORY";
    return { load, latencyFactor, epsilon, pressure, posture };
  }, [cpu, memory, latency]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main id="main-content" className="site-shell">
      <GlobalNavigation />

      <section id="top" className="hero-section">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-vignette" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-pulse" /> UIPT / RUNTIME GOVERNANCE / 01</div>
            <h1>Systems that know <em>when to hold.</em></h1>
            <p className="hero-lede">ONSOUR is a self-regulating runtime for resilient autonomous systems—built to adapt under pressure without surrendering auditability.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => scrollTo("loop")}>Explore the control loop <ArrowRight size={17} /></button>
              <button className="button button-quiet" onClick={() => scrollTo("thesis")}>Read the thesis <ArrowDownRight size={17} /></button>
            </div>
            <div className="hero-stamp"><span>BUILT ON</span><strong>Rust / Rayon / Logical Time</strong></div>
          </div>
          <div className="hero-aside">
            <div className="hero-aside-line" />
            <span className="mono-label">A DIGITAL ORGANISM</span>
            <p>It hardens when the field is stressed. It opens when the field is clear. Every decision leaves a trail.</p>
            <div className="hero-aside-index">01 <span>/</span> 06</div>
          </div>
        </div>
        <div className="scroll-cue"><span /> Scroll to enter the field</div>
      </section>

      <section id="thesis" className="section section-thesis">
        <div className="container thesis-grid">
          <div className="thesis-intro">
            <SectionKicker>01 / THE THESIS</SectionKicker>
            <h2>Rigidity breaks.<br /><span>Homeostasis scales.</span></h2>
            <p className="section-lede">Autonomous systems do not fail because they lack intelligence. They fail because their rules stay static while the environment moves.</p>
            <div className="side-note"><span className="mono-label">FIELD NOTE / 001</span><p>Traditional controls ask, “What should the system do?” ONSOUR first asks, “What can the system safely hold right now?”</p></div>
          </div>
          <div className="thesis-visual">
            <div className="visual-frame pressure-visual">
              <div className="field-grid" />
              <div className="pressure-sphere"><span /><span /><span /></div>
              <div className="pressure-wave wave-one" /><div className="pressure-wave wave-two" />
              <div className="pressure-metric metric-load"><span className="mono-label">Λ LOAD</span><strong>0.68</strong></div>
              <div className="pressure-metric metric-barrier"><span className="mono-label">ε BARRIER</span><strong>0.061</strong></div>
              <div className="frame-caption"><span>ENVIRONMENTAL PRESSURE</span><b>Load ↑ / Barrier ↓</b></div>
            </div>
            <div className="thesis-note-grid">
              <div><strong>01</strong><span>Static thresholds treat calm and crisis as the same world.</span></div>
              <div><strong>02</strong><span>Dynamic governance lets the runtime breathe with reality.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-innovation">
        <div className="container innovation-grid">
          <div className="innovation-copy">
            <SectionKicker>02 / THE INNOVATION</SectionKicker>
            <h2>The barrier is<br /><span>alive.</span></h2>
            <p className="section-lede">Dynamic epsilon turns system health into a governing field. Pressure rises, the barrier tightens. Capacity returns, exploration resumes.</p>
            <div className="formula-lockup">
              <span className="mono-label">DYNAMIC EPSILON / CORE RELATION</span>
              <div className="formula">ε(t) = clamp <i>[</i> ε<sub>base</sub> · <span>(1 − 0.4Λ)</span> <span className="formula-divide">/</span> <span>(1 + 0.2ℒ)</span> <i>]</i></div>
              <p>Λ is composite resource load. ℒ is normalized network latency. Both are smoothed before the barrier moves.</p>
            </div>
            <button className="text-link" onClick={() => setShowModel(!showModel)}>{showModel ? "Hide model notes" : "See the model notes"} <ArrowRight size={16} /></button>
            {showModel && <div className="model-note"><Check size={15} /> `min_epsilon` and `max_epsilon` bound the field. Non-finite or stale telemetry fails strict.</div>}
          </div>
          <div className="innovation-visual equilibrium-visual">
            <div className="field-grid" />
            <div className="equilibrium-ring ring-a" /><div className="equilibrium-ring ring-b" /><div className="equilibrium-ring ring-c" />
            <div className="equilibrium-core"><Orbit size={22} /><span>Λ / ℒ</span></div>
            <div className="equilibrium-node eq-one" /><div className="equilibrium-node eq-two" /><div className="equilibrium-node eq-three" /><div className="equilibrium-node eq-four" />
            <div className="image-overlay-label"><Orbit size={16} /> LIVING CONSTRAINT</div>
            <div className="signal-track"><span /><span /><span /><span /><span /></div>
          </div>
        </div>
      </section>

      <section id="loop" className="section section-loop">
        <div className="container loop-heading">
          <SectionKicker>03 / THE CONTROL LOOP</SectionKicker>
          <div className="loop-heading-row"><div><div className="section-number">03</div><h2>Raw telemetry enters.<br /><span>Authoritative state leaves.</span></h2></div><p>One loop. Four decisions. Zero ambiguity.</p></div>
        </div>
        <div className="container loop-layout">
          <HomeostasisLoop activeStep={activeStep} setActiveStep={setActiveStep} />
          <div className="flow-list">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button key={step.id} className={`flow-item ${activeStep === index ? "is-active" : ""}`} onClick={() => setActiveStep(index)}>
                  <div className={`flow-icon flow-icon-${step.accent}`}><Icon size={17} /></div>
                  <div className="flow-text"><span className="mono-label">{step.label}</span><strong>{step.title}</strong><p>{step.body}</p></div>
                  <span className="flow-index">0{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-lab">
        <div className="container lab-grid">
          <div className="lab-intro">
            <SectionKicker>04 / THE LIVE FIELD</SectionKicker>
            <h2>See the barrier<br /><span>move.</span></h2>
            <p className="section-lede">Dial the environment. Watch the governance posture change in real time.</p>
            <div className="lab-readout"><span className="mono-label">CURRENT POSTURE</span><strong>{model.posture}</strong><p>Lower epsilon means a narrower path through the state space.</p></div>
          </div>
          <div className="lab-console">
            <div className="console-top"><span><span className="console-dot" /> LIVE SIMULATION</span><span className="mono-label">EPOCH 0042 / TICK 018</span></div>
            <div className="console-value"><span className="mono-label">AUTHORITATIVE ε</span><strong>{model.epsilon.toFixed(4)}</strong><div className="value-delta">{model.posture === "STRICT DEFENSE" ? "− tightened under pressure" : "+ room for exploration"}</div></div>
            <div className="console-bars"><div className="console-bar"><span className="mono-label">COMPOSITE LOAD</span><div className="bar-track"><span style={{ width: `${model.load * 100}%` }} /></div><b>{formatPercent(model.load)}</b></div><div className="console-bar"><span className="mono-label">LATENCY FACTOR</span><div className="bar-track bar-track-amber"><span style={{ width: `${Math.min(model.latencyFactor / 2, 1) * 100}%` }} /></div><b>{latency}ms</b></div></div>
            <div className="console-sliders">
              <label><span><span>CPU LOAD</span><b>{formatPercent(cpu)}</b></span><input type="range" min="0" max="1" step="0.01" value={cpu} onChange={(e) => setCpu(Number(e.target.value))} /></label>
              <label><span><span>MEMORY PRESSURE</span><b>{formatPercent(memory)}</b></span><input type="range" min="0" max="1" step="0.01" value={memory} onChange={(e) => setMemory(Number(e.target.value))} /></label>
              <label><span><span>NETWORK LATENCY</span><b>{latency}ms</b></span><input type="range" min="0" max="300" step="1" value={latency} onChange={(e) => setLatency(Number(e.target.value))} /></label>
            </div>
            <div className="console-footer"><span><RotateCcw size={14} /> rollback armed</span><span><Database size={14} /> snapshot ready</span></div>
          </div>
        </div>
      </section>

      <section id="proof" className="section section-proof">
        <div className="container proof-grid">
          <div className="proof-image replay-visual"><div className="replay-grid" /><div className="replay-ring replay-ring-one" /><div className="replay-ring replay-ring-two" /><div className="replay-trace trace-one" /><div className="replay-trace trace-two" /><div className="replay-node replay-node-one" /><div className="replay-node replay-node-two" /><div className="replay-node replay-node-three" /><div className="proof-image-caption"><span className="mono-label">AUTHORITATIVE REPLAY</span><strong>Memory without mythology.</strong></div></div>
          <div className="proof-copy"><SectionKicker>05 / THE PROOF</SectionKicker><h2>Trust is a<br /><span>replayable state.</span></h2><p className="section-lede">Logical timestamps and authoritative snapshots separate computation from application. The runtime can adapt in the field—and still explain itself afterward.</p><div className="proof-list"><div><Check size={16} /><span><b>Logical time</b> replaces machine-dependent clocks.</span></div><div><Check size={16} /><span><b>Snapshots</b> preserve the exact epsilon used per epoch.</span></div><div><Check size={16} /><span><b>Rollback</b> restores the last stable buffer without ambiguity.</span></div></div></div>
        </div>
      </section>

      <section id="capabilities" className="section section-capabilities">
        <div className="container">
          <CapabilityMatrixShowcase />
        </div>
      </section>

      <section id="contact" className="section section-close">
        <div className="container close-grid">
          <div><SectionKicker>06 / THE INVITATION</SectionKicker><h2>Build systems<br /><span>that hold.</span></h2><p>ONSOUR is the governance layer for the next generation of resilient, autonomous intelligence.</p></div>
          <div className="close-action"><button className="button button-primary" onClick={() => window.location.href = "mailto:hello@onsour.systems?subject=ONSOUR%20Investor%20Briefing"}>Request the investor briefing <ArrowRight size={17} /></button><span className="mono-label">ONSOUR / UIPT / RUNTIME HOMEOSTASIS</span></div>
        </div>
      </section>

      <GlobalFooter />
    </main>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={15} className="arrow-up-right" />;
}
