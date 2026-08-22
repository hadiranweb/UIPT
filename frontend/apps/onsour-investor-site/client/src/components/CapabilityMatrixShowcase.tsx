import { useState } from "react";
import { Link } from "wouter";
import {
  Check,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  Layers,
  Orbit,
  Play,
  RefreshCcw,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    id: "lab",
    title: "Live Dispersion & Governance Lab",
    category: "Real-Time Simulation",
    description: "Upload JSON graph datasets, tune the epsilon barrier, observe dispersion deltas, and test atomic rollbacks live in your browser.",
    badge: "Zero Uploads",
    link: "/lab",
    linkText: "Open Live Dispersion Lab",
    icon: Zap,
    metrics: ["Client-side Zod schemas", "Dynamic epsilon sliders", "Live accept/rollback rules"],
  },
  {
    id: "theory",
    title: "UIPT-A & Landau-Ginzburg Theory",
    category: "Mathematical Core",
    description: "Rigorous phase transitions, spontaneous symmetry breaking, and single/double well potentials grounded in thermodynamic principles.",
    badge: "Mathematical Rigor",
    link: "/articles",
    linkText: "Read SEO Research Papers",
    icon: Orbit,
    metrics: ["V(θ) = -½rθ² + ¼uθ⁴", "Exact min/max readouts", "Interactive potential wells"],
  },
  {
    id: "governance",
    title: "Dynamic Thermodynamic Epsilon",
    category: "Homeostasis Governor",
    description: "Adaptive barrier tuning based on live CPU, memory, and network load with EMA smoothing and atomic rollback.",
    badge: "Fail-Safe Telemetry",
    link: "/docs",
    linkText: "Test in Live Lab",
    icon: Gauge,
    metrics: ["~3.7ns epsilon tuning", "EMA smoothing filter", "Atomic accept / rollback"],
  },
  {
    id: "ecosystem",
    title: "Developer Hub & SDKs",
    category: "Developer Experience",
    description: "Complete developer resources, Zod graph contracts, tRPC persistence routers, and Rust core references.",
    badge: "Developer Ready",
    link: "/ecosystem",
    linkText: "Open Developer Hub",
    icon: Cpu,
    metrics: ["Zod v1 graph schemas", "tRPC persistence API", "Rust Rayon core SDK"],
  },
  {
    id: "explorer",
    title: "Obsidian-Inspired Graph Explorer",
    category: "Topological Analysis",
    description: "Interactive node selection, force-directed relaxation, local depth focus (1-4), regex cluster coloring, and PNG/SVG export.",
    badge: "Visual Inspection",
    link: "/docs",
    linkText: "Open Graph Explorer",
    icon: Workflow,
    metrics: ["Directed topological flows", "Regex cluster rules", "High-res vector export"],
  },
  {
    id: "persistence",
    title: "MySQL Persistence & Provenance Feed",
    category: "Authoritative Replay",
    description: "Complete database storage via tRPC with versioned Zod schemas, epoch tracking, adaptation metrics, and provenance metadata.",
    badge: "Authoritative Audit",
    link: "/docs",
    linkText: "Inspect Persistence Feed",
    icon: Database,
    metrics: ["saved_analyses table", "Engine version tracking", "Epoch adaptation trends"],
  },
  {
    id: "replay",
    title: "Authoritative Replay & Rollback Snapshots",
    category: "Deterministic Memory",
    description: "Replay past decision epochs with exact logical timestamps, snapshot hashes, state roots, and zero-ambiguity double buffering rollbacks.",
    badge: "100% Deterministic",
    link: "/docs",
    linkText: "Verify Replay State",
    icon: ShieldCheck,
    metrics: ["Governance snapshots", "Exact state roots", "Double buffering safety"],
  },
];

export function CapabilityMatrixShowcase() {
  const [activeId, setActiveId] = useState(capabilities[0].id);
  const activeItem = capabilities.find((c) => c.id === activeId) ?? capabilities[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="capability-matrix-container">
      <div className="capability-matrix-header">
        <span className="section-kicker"><span className="kicker-dot" /> ONSOUR ECOSYSTEM CAPABILITY MATRIX</span>
        <h3>Built from the metal up. Experience every architectural layer live.</h3>
        <p>Explore the independent ONSOUR core capabilities—from UIPT mathematical grounding and thermodynamic governance to WASM performance and MySQL database auditability.</p>
      </div>

      <div className="capability-matrix-grid">
        <div className="capability-nav-list" role="tablist" aria-label="ONSOUR Capabilities">
          {capabilities.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`capability-nav-item ${isSelected ? "is-selected" : ""}`}
                onClick={() => setActiveId(item.id)}
              >
                <div className="capability-item-icon">
                  <ItemIcon size={18} />
                </div>
                <div className="capability-item-copy">
                  <span className="capability-item-category">{item.category}</span>
                  <strong>{item.title}</strong>
                </div>
              </button>
            );
          })}
        </div>

        <div className="capability-detail-card">
          <div className="capability-card-top">
            <span className="capability-badge">{activeItem.badge}</span>
            <span className="capability-category-pill">{activeItem.category}</span>
          </div>

          <div className="capability-card-main">
            <div className="capability-main-icon">
              <ActiveIcon size={28} />
            </div>
            <div>
              <h4>{activeItem.title}</h4>
              <p>{activeItem.description}</p>
            </div>
          </div>

          <div className="capability-metrics-strip">
            <span className="mono-label">VERIFIED SPECIFICATION METRICS</span>
            <div className="capability-metric-pills">
              {activeItem.metrics.map((m, idx) => (
                <span key={idx} className="capability-metric-pill">
                  <Check size={12} /> {m}
                </span>
              ))}
            </div>
          </div>

          <div className="capability-card-footer">
            <Link href={activeItem.link} className="capability-action-link">
              <span>{activeItem.linkText}</span>
              <Workflow size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
