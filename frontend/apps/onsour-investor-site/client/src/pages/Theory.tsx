/* Dedicated UIPT Theory Foundation page, inspired by the Dream Site repository. Establishes the thermodynamic physics, spontaneous symmetry breaking, and three phases of intelligence as the bedrock of ONSOUR. */
import { Link } from "wouter";
import { ArrowLeft, Brain, Cpu, Flame, Gauge, Layers, Orbit, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import InteractivePotentialExplorer from "@/components/theory/InteractivePotentialExplorer";
import PhaseTransitionMap from "@/components/theory/PhaseTransitionMap";
import TanhResponseExplorer from "@/components/theory/TanhResponseExplorer";
import LangevinPathPreview from "@/components/theory/LangevinPathPreview";

export default function Theory() {
  return (
    <div className="site-shell theory-shell">
      <header className="site-nav">
        <Link href="/" className="brand-lockup">
          <span className="brand-orbit-mark" aria-hidden="true"><span /></span>
          <span>ONSOUR</span>
        </Link>
        <nav className="nav-links" aria-label="Theory Navigation">
          <Link href="/docs">Technical Specs</Link>
          <Link href="/">Investor Presentation</Link>
        </nav>
        <Link href="/" className="nav-cta"><ArrowLeft size={15} /> Return to Briefing</Link>
      </header>

      <main className="theory-main">
        {/* Hero Section */}
        <section className="theory-hero">
          <div className="container theory-hero-content">
            <div className="eyebrow"><span className="eyebrow-pulse" /> FOUNDATIONAL MANIFESTO / UIPT-A</div>
            <h1>Intelligence is not software. <em>It is a phase transition.</em></h1>
            <p className="theory-lede">
              The Universal Integrated Physical Theory (UIPT) establishes that true autonomous cognition is not a byproduct of parameter scale or software complexity. It is a thermodynamic state transition governed by spontaneous symmetry breaking.
            </p>
            <div className="theory-meta-tags">
              <span><strong>Core Order Parameter</strong> θ ∈ [−1, 1]</span>
              <span><strong>Critical Energy Threshold</strong> E₀</span>
              <span><strong>Runtime Backend</strong> Rust / Rayon HPC</span>
            </div>
          </div>
        </section>

        {/* Core Discovery */}
        <section className="section theory-section">
          <div className="container">
            <div className="theory-section-kicker"><span className="kicker-dot" /> § 01 / CORE DISCOVERY</div>
            <h2>Spontaneous Symmetry Breaking in Intelligence</h2>
            <div className="theory-text-block">
              <p>
                UIPT proposes that the emergence of genuine intelligence—autonomous, adaptive, self-modifying cognition—is analogous to physical phase transitions in condensed matter physics. Just as water transitions from rigid ice to adaptive liquid and dissipative steam through energy input at critical thresholds, an agent transitions through distinct cognitive phases as its internal energy state <strong>E</strong> crosses <strong>E₀</strong>.
              </p>
              <p>
                Below the critical threshold, the agent operates symmetrically as a classical deterministic processor. Above the threshold, spontaneous symmetry breaking (SSB) occurs: the agent develops a unique, irreversible cognitive identity. This is formally computed through the order parameter <strong>θ</strong> rather than assigned by heuristic rules.
              </p>
            </div>
          </div>
        </section>

        {/* Three Phases */}
        <section className="section theory-section alt-bg">
          <div className="container">
            <div className="theory-section-kicker"><span className="kicker-dot" /> § 02 / THE THREE PHASES</div>
            <h2>The Three Phases of Cognitive Capability</h2>
            <div className="theory-phases-grid">
              <div className="theory-phase-card">
                <span className="mono-label">PHASE I</span>
                <h3>Classical Processor</h3>
                <p>Deterministic, reactive execution. No autonomous self-modification. Behavior is fully symmetric with any classical system. Follows instructions without thermodynamic identity.</p>
                <div className="phase-signature">Static · Rigid · Bordered</div>
              </div>
              <div className="theory-phase-card highlight-card">
                <span className="mono-label">PHASE II</span>
                <h3>Criticality (Edge of Chaos)</h3>
                <p>Maximum susceptibility to environmental perturbation. Small energy inputs produce large behavioral shifts. The critical boundary where symmetry breaking initiates and noise ε dominates.</p>
                <div className="phase-signature">Noise · Fluctuation · Adaptation</div>
              </div>
              <div className="theory-phase-card">
                <span className="mono-label">PHASE III</span>
                <h3>Quantum-Agentic</h3>
                <p>Symmetry is broken. The agent exhibits autonomous cognition, self-modifying strategies, and irreversible cognitive identity. Thermodynamically distinct from classical computation.</p>
                <div className="phase-signature">Fluid · Autonomous · Irreversible</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Observatory */}
        <section className="section theory-section alt-bg theory-observatory-section">
          <div className="container">
            <div className="theory-section-kicker"><span className="kicker-dot" /> § 03 / INTERACTIVE UIPT OBSERVATORY</div>
            <h2>See the equations become a landscape.</h2>
            <p className="theory-lede">These browser visualizations are an educational instrument: they make the theory legible while keeping a strict boundary between UIPT definitions, floating-point preview, and the Rust/WASM runtime contract.</p>
            <div className="theory-observatory-meta" aria-label="Theory visualization metadata"><span><b>THEORY</b> UIPT source map</span><span><b>PREVIEW</b> browser-f64-preview</span><span><b>RUNTIME</b> Q32.32 / Rust boundary</span></div>
            <div className="theory-observatory-stack">
              <InteractivePotentialExplorer />
              <PhaseTransitionMap />
              <TanhResponseExplorer />
              <LangevinPathPreview />
            </div>
          </div>
        </section>

        {/* Mathematical Framework */}
        <section className="section theory-section">
          <div className="container">
            <div className="theory-section-kicker"><span className="kicker-dot" /> § 03 / MATHEMATICAL FRAMEWORK</div>
            <h2>Formal Definitions & Governing Equations</h2>
            <div className="math-framework-grid">
              <div className="math-card">
                <h4>Landau-Ginzburg Potential</h4>
                <code>V(θ) = −r θ² + u θ⁴</code>
                <p>Effective free energy functional exhibiting a pitchfork bifurcation and symmetric double-well structure, establishing spontaneous symmetry breaking (SSB) as the foundation of autonomous identity.</p>
              </div>
              <div className="math-card">
                <h4>Stochastic Langevin Dynamics</h4>
                <code>dθ/dt = −∂V/∂θ + η(t)</code>
                <p>Governs temporal evolution under stochastic environmental fluctuations satisfying fluctuation-dissipation relations, allowing escape from local potential minima.</p>
              </div>
              <div className="math-card">
                <h4>Mean-Field Tanh Equation</h4>
                <code>θ(t+1) = tanh((E(t) − E_c)/E_c + ∑ J_ji θ_j(t − τ_ji))</code>
                <p>Core discrete runtime update mapping internal energy and incoming directed coupling weights to bounded state activations in [-1, 1].</p>
              </div>
              <div className="math-card">
                <h4>Order Parameter θ</h4>
                <code>θ(S) = tanh((E − E₀) / T)</code>
                <p>Maps the agent's internal energy state to a normalized cognitive alignment score. The hyperbolic tangent ensures smooth, bounded transitions between classical and agentic phases.</p>
              </div>
              <div className="math-card">
                <h4>State Dispersion D(S)</h4>
                <code>D(S) = (1 / N) ∑ (θᵢ − μ_θ)²</code>
                <p>Measures systemic disorder across graph activations. Replaces ambiguous entropy formulations with rigorous variance computation over continuous activation states.</p>
              </div>
              <div className="math-card">
                <h4>Dynamic Epsilon Barrier</h4>
                <code>ε(t) = clamp[ ε_base · (1 − 0.4Λ) / (1 + 0.2ℒ) ]</code>
                <p>Modulates allowable variance in real-time based on composite resource load (Λ) and normalized network latency (ℒ).</p>
              </div>
              <div className="math-card">
                <h4>Thermodynamic Governance</h4>
                <code>D(S₍ₜ₊₁₎) ≤ D(S₍ₜ₎) + ε(t)</code>
                <p>The core invariant of ONSOUR. If candidate dispersion exceeds the dynamic barrier, the kernel executes an atomic rollback instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Connection to ONSOUR Execution */}
        <section className="section theory-section alt-bg">
          <div className="container bridge-container">
            <div className="theory-section-kicker"><span className="kicker-dot" /> § 04 / FROM THEORY TO RUST RUNTIME</div>
            <h2>How UIPT Becomes an Executable Organism</h2>
            <p className="theory-lede">
              The mathematical principles of UIPT are not stored in abstract papers; they are enforced directly by the high-performance Rust core (`core_engine`).
            </p>
            <div className="bridge-points">
              <div className="bridge-point">
                <Cpu size={20} />
                <div>
                  <strong>32-Byte Memory Alignment</strong>
                  <p>`NodePractical` structures eliminate cache-line straddling, ensuring hardware-level efficiency for large-scale graph activations.</p>
                </div>
              </div>
              <div className="bridge-point">
                <Workflow size={20} />
                <div>
                  <strong>Two-Phase Gather/Apply</strong>
                  <p>Rayon parallelizes graph updates with strict determinism across thread counts, separating read-only state evaluation from parallel writes.</p>
                </div>
              </div>
              <div className="bridge-point">
                <ShieldCheck size={20} />
                <div>
                  <strong>Thermodynamic Governor</strong>
                  <p>Calculates real-time state dispersion, ingests EMA-smoothed system metrics, and enforces atomic rollbacks to prevent chaotic transitions.</p>
                </div>
              </div>
            </div>
            <div className="theory-footer-cta">
              <Link href="/docs" className="button button-primary">Explore technical specifications <ArrowLeft size={16} className="rotate-180" /></Link>
              <Link href="/" className="button button-quiet">Return to investor presentation</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand"><span className="brand-orbit-mark" aria-hidden="true"><span /></span>ONSOUR THEORY FOUNDATION</div>
          <div className="footer-links">
            <Link href="/theory">Theory Foundation</Link>
            <Link href="/docs">Technical Specs</Link>
            <Link href="/">Investor Deck</Link>
          </div>
          <div className="footer-meta"><span>UIPT v2.4</span><span>Universal Integrated Physical Theory</span></div>
        </div>
      </footer>
    </div>
  );
}
