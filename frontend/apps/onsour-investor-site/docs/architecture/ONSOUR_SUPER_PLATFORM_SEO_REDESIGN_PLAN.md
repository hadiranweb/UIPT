# ONSOUR Super-Platform & Technical SEO Redesign Master Plan

## 1. Executive Summary & Vision Shift
The ONSOUR project has evolved from an investor briefing site into a rigorous, independent decentralized intelligence core based on **Universal Integrated Physical Theory (UIPT)**, Rust/Rayon parallel execution, thermodynamic governance, and deterministic replay. 

To transition ONSOUR into a **Super-Platform** (capable of attracting researchers, system engineers, developers, and enterprise stakeholders while satisfying strict search engine indexing requirements), we must transform the frontend from a static presentation into an **instrumented, crawlable, and interactive capability hub**.

---

## 2. Information Architecture (IA) & Route Taxonomy

```
[ ON-SOUR SUPER-PLATFORM ]
├── / (Global Hub / Platform Landing)
│   ├── Super-Platform Capability Matrix
│   ├── Interactive Live Telemetry Ticker
│   └── Multi-Persona Navigation (Researchers / Engineers / Stakeholders)
├── /lab (Live Dispersion & Governance Lab)
│   ├── Graph JSON Ingestion & Zod Validation
│   ├── Thermodynamic Governor Slider (ε adaptation)
│   ├── Real-Time WASM / JS Fallback Benchmark HUD
│   └── Obsidian-Inspired Interactive Graph Explorer
├── /theory (UIPT Theoretical Foundation)
│   ├── Landau-Ginzburg Potential Explorer
│   ├── Phase Transition & Spontaneous Symmetry Breaking Map
│   ├── Mean-Field Tanh Response Visualizer
│   └── Seeded Langevin Trajectory Simulator
├── /docs (Engine & Governance Specifications)
│   ├── Rust Rayon Parallel Pipeline Specs
│   ├── Zod v1 Graph Analysis Contracts
│   ├── MySQL Persistence Schema & Provenance Feed
│   └── Authoritative Replay & Rollback Architecture
└── /ecosystem (Module Index & Developer Hub)
    ├── SDKs, Contracts, and Schema Registry
    ├── CLI & GitHub Integration Guidelines
    └── Community & Governance Proposals
```

---

## 3. Technical SEO & Crawlability Strategy (SSR & Prerendering)

Search engine crawlers and social scrapers (Googlebot, Bingbot, Twitter/X, LinkedIn) require fully populated HTML on first paint. To achieve 100% SEO parity without sacrificing client interactivity:

1. **Dynamic Open Graph & Meta Tags (`Head.tsx`):**
   - Every primary route (`/`, `/lab`, `/theory`, `/docs`) emits unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, and `rel="canonical"` tags.
2. **Semantic Structured Data (JSON-LD):**
   - Inject `SoftwareApplication` and `ScholarlyArticle` schema markup into the server-rendered HTML for search engine knowledge graphs.
3. **Crawl-Friendly Sitemap & robots.txt:**
   - Automatically generate `/sitemap.xml` listing all core routes and reference documentation.
4. **Performance & Core Web Vitals:**
   - Maintain sub-second LCP (Largest Contentful Paint) by optimizing font loading, pre-rendering static sections, and deferring non-critical canvas calculations until hydration.

---

## 4. UI/UX Super-Platform Redesign Blueprint

### 4.1. Design System Evolution ("Living Infrastructure")
- **Color Palette:** Deep void obsidian background (`#030b12`), Flux Cyan telemetry (`#74f0e4`), Thermodynamic Amber (`#f5b86b`), and structured slate borders (`rgba(42, 133, 139, 0.25)`).
- **Typography:** Display headings in *Space Grotesk*, body copy in clean sans-serif, and technical telemetry in *IBM Plex Mono*.
- **Micro-Interactions:** Snappy CSS transitions (180ms ease-out), active scale feedback, and accessible keyboard focus rings.

### 4.2. Super-Platform Homepage (`Home.tsx`)
- **Hero Section:** Dynamic value proposition with live telemetry ticker (nodes processed, active epoch, adaptation metric).
- **Capability Matrix Hub:** Interactive card grid connecting directly to the Live Lab, Theory Observatory, and Rust specs.
- **Interactive Preview Widget:** A mini live-dispersion meter embedded directly on the landing page so visitors experience the physics engine within 3 seconds of arrival.

---

## 5. Execution Roadmap & Milestones

| Phase | Milestone | Core Deliverable |
|---|---|---|
| **Phase 1** | Route Expansion | Establish explicit routes for `/lab`, `/theory`, `/docs`, and `/ecosystem`. |
| **Phase 2** | SEO Metatags & SSR Prep | Implement dynamic head management, canonical tags, and JSON-LD structured data. |
| **Phase 3** | Landing Page Redesign | Transform `Home.tsx` into a multi-persona super-platform gateway with live telemetry. |
| **Phase 4** | Unified Navigation & Command Palette | Add global command shortcut (`Ctrl+K`) for instantaneous feature discovery. |
| **Phase 5** | Verification & Validation | Run typecheck, Vitest unit suites, production build, and mobile/desktop QA. |
