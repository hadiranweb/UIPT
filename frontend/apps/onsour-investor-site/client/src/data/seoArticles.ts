export type SeoArticle = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  publishedAt: string;
  summary: string;
  contentHtml: string;
  keywords: string[];
};

export const seoArticles: SeoArticle[] = [
  {
    slug: "universal-integrated-physical-theory-primer",
    title: "Universal Integrated Physical Theory (UIPT): A First-Principles Foundation for Decentralized Autonomous Intelligence",
    subtitle: "Moving beyond parameter scaling laws into thermodynamic phase transitions and spontaneous symmetry breaking.",
    category: "Theoretical Physics & AI",
    readTime: "8 min read",
    publishedAt: "2026-08-01",
    keywords: ["UIPT", "Landau-Ginzburg Potential", "Spontaneous Symmetry Breaking", "Decentralized AI", "Thermodynamic Homeostasis"],
    summary: "An exploration of UIPT-A principles, explaining why autonomous cognition requires thermodynamic stability, order parameters, and double-well energy potentials rather than unconstrained neural parameter growth.",
    contentHtml: `
      <h2>1. The Scaling Fallacy in Modern AI</h2>
      <p>For over half a decade, artificial intelligence research has been dominated by a singular axiom: compute more parameters, ingest more web scraped text, and emergent intelligence will naturally follow. However, unconstrained parameter scaling suffers from fundamental thermodynamic limitations—high energy dissipation, catastrophic forgetting, and severe vulnerability to out-of-distribution drift. ONSOUR approaches this differently through <strong>Universal Integrated Physical Theory (UIPT)</strong>.</p>
      
      <h2>2. Landau-Ginzburg Potential & Order Parameters</h2>
      <p>In UIPT, system order is governed by a continuous order parameter $\\theta \\in [-1, 1]$ representing local activation alignment. The system potential $V(\\theta)$ follows the classical Landau-Ginzburg formulation:</p>
      <div class="math-block">
        <code>V(\\theta) = -\\frac{1}{2} r \\theta^2 + \\frac{1}{4} u \\theta^4</code>
      </div>
      <p>When environmental pressure rises, the quadratic coefficient $r$ shifts from positive to negative, inducing spontaneous symmetry breaking. This forces the system from a chaotic zero-state into one of two stable operational attractors.</p>

      <h2>3. The Thermodynamic Governor & $\\epsilon(t)$ Adaptation</h2>
      <p>Instead of relying on rigid thresholds, ONSOUR computes State Dispersion $D(S)$ across graph nodes and regulates transitions via an adaptive epsilon barrier $\\epsilon(t)$ that responds dynamically to CPU load and network latency. If candidate dispersion exceeds the barrier, an atomic rollback restores the last known stable double-buffer.</p>
    `,
  },
  {
    slug: "rust-rayon-parallel-graph-execution",
    title: "High-Performance Graph Processing with Rust and Rayon: The Q32.32 Fixed-Point Architecture",
    subtitle: "Achieving cross-platform bitwise determinism and sub-100ns node execution times in decentralized networks.",
    category: "Systems Engineering",
    readTime: "10 min read",
    publishedAt: "2026-08-10",
    keywords: ["Rust", "Rayon", "Fixed-Point Arithmetic", "Double Buffering", "Deterministic Execution", "WASM"],
    summary: "A technical deep dive into ONSOUR's Rayon-powered execution kernel, detailing 32-byte cache-line alignment, Gather/Apply separation, and Q32.32 fixed-point math.",
    contentHtml: `
      <h2>1. The Challenge of Parallel Determinism</h2>
      <p>Standard multi-threaded graph processing suffers from race conditions when worker threads simultaneously mutate shared neighbor accumulators. ONSOUR solves this at the systems level using a strict <strong>Two-Phase Gather/Apply Execution Model</strong> implemented in Rust.</p>
      
      <h2>2. Phase Separation & Double Buffering</h2>
      <ul>
        <li><strong>Phase 1 (Gather):</strong> Workers perform read-only scans of <code>State(t)</code>. Incoming edges are grouped and sorted by source index to guarantee deterministic floating-point reduction order.</li>
        <li><strong>Phase 2 (Apply):</strong> Embarrassingly parallel updates compute <code>State(t+1)</code> where each node index is written by exactly one worker thread.</li>
      </ul>
      <p>Once an epoch completes, pointers swap instantly via double buffering, eliminating intermediate locking overhead.</p>

      <h2>3. Hardware Alignment & Benchmarks</h2>
      <p>By structuring node metadata into 32-byte aligned <code>NodePractical</code> structs, ONSOUR eliminates cache-line straddling. Release-profile benchmarks on standard multi-core hardware record sustained throughputs of <strong>95.44 ns per node per epoch</strong>.</p>
    `,
  },
  {
    slug: "authoritative-replay-and-governance-snapshots",
    title: "Authoritative Replay and Logical Timestamps: Eliminating Non-Determinism in Distributed Systems",
    subtitle: "How ONSOUR decouples live machine telemetry from immutable historical state records.",
    category: "Data Integrity & Governance",
    readTime: "6 min read",
    publishedAt: "2026-08-18",
    keywords: ["Authoritative Replay", "Logical Timestamps", "Governance Snapshots", "MySQL Persistence", "Zod Schemas"],
    summary: "Learn how ONSOUR uses logical timestamps and epoch-level thermodynamic snapshots to guarantee 100% reproducible execution trajectories without relying on local system clocks.",
    contentHtml: `
      <h2>1. The Problem with Wall-Clock Time</h2>
      <p>Distributed systems that depend on local machine clocks (<code>Instant::now()</code>) are inherently non-deterministic. Network jitter, CPU frequency scaling, and time-zone drift corrupt historical audits.</p>
      
      <h2>2. Logical Timestamps & Governance Snapshots</h2>
      <p>ONSOUR replaces wall-clock time with <strong>Logical Timestamps</strong> (<code>LogicalTimestamp { epoch_number, tick_within_epoch }</code>). Every decision epoch produces an immutable <strong>Governance Snapshot</strong> recording the exact $\\epsilon$ barrier, node states, and state root hash.</p>

      <h2>3. MySQL Persistence & Provenance Feed</h2>
      <p>All analyses are persisted via tRPC and Drizzle ORM into structured database tables with full provenance metadata (engine version, numeric mode, epoch ID), allowing auditors and developers to replay past decision paths with zero ambiguity.</p>
    `,
  },
];
