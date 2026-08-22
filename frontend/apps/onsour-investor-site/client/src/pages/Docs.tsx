/* Technical Documentation sub-page for system engineers and UIPT researchers. Maintains the Living Infrastructure observatory aesthetic while providing rigorous architecture specs, formula derivations, and code blueprints. */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Database,
  Download,
  FileText,
  Gauge,
  Layers,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";

const symbolImage = "/manus-storage/onsour-symbol_2ce6435f.png";

const docSections = [
  { id: "overview", label: "01 / Architecture Overview" },
  { id: "governance", label: "02 / Thermodynamic Governor" },
  { id: "execution", label: "03 / Dual-Buffer Graph Kernel" },
  { id: "replay", label: "04 / Logical Time & Replay" },
  { id: "api", label: "05 / Core API & Rust Specs" },
  { id: "lab", label: "06 / Live Dispersion Lab" },
];

type GraphNode = { id: string; theta: number; label?: string; tags?: string[] };
type GraphEdge = { src: string; dst: string; weight: number };
type GraphDataset = {
  currentNodes: GraphNode[];
  candidateNodes: GraphNode[];
  edges: GraphEdge[];
  edgeCount: number;
  name?: string;
};

type GraphAnalysis = GraphDataset & {
  currentDispersion: number;
  candidateDispersion: number;
  accepted: boolean;
};

type ClusterRule = { id: string; label: string; pattern: string; color: string };

const DEFAULT_CLUSTER_RULES: ClusterRule[] = [
  { id: "kernel", label: "Kernel / governance", pattern: "kernel|core|governor|runtime", color: "#b9a7ff" },
  { id: "field", label: "State / dispersion", pattern: "field|entropy|memory|dispersion", color: "#74f0e4" },
  { id: "replay", label: "Replay / ethics", pattern: "replay|ethics|observer|determinism", color: "#f5b86b" },
];

function nodeSearchText(node: GraphNode) {
  return [node.id, node.label ?? "", ...(node.tags ?? [])].join(" ");
}

function matchesClusterRule(node: GraphNode, rule: ClusterRule) {
  if (!rule.pattern.trim()) return false;
  const text = nodeSearchText(node);
  try {
    return new RegExp(rule.pattern, "i").test(text);
  } catch {
    return text.toLowerCase().includes(rule.pattern.trim().toLowerCase());
  }
}

type BenchmarkResult = {
  browserNsPerNode: number;
  browserTotalMs: number;
  rustNsPerNode: number;
  nodes: number;
  iterations: number;
  ratio: number;
};

type SavedAnalysisRecord = {
  id: number;
  epoch: number;
  name: string;
  nodeCount: number;
  edgeCount: number;
  currentDispersion: string;
  candidateDispersion: string;
  epsilon: string;
  adaptationMetric: string;
  decision: string;
  payloadJson: string;
  createdAt: Date;
};

function getEpochLabel(item: Pick<SavedAnalysisRecord, "epoch" | "name">, fallbackIndex: number) {
  if (item.epoch > 0) return `E${String(item.epoch).padStart(4, "0")}`;
  const match = item.name.match(/epoch[-_ ]?(\d+)/i);
  if (match) return `E${String(Number(match[1])).padStart(4, "0")}`;
  return `E${String(fallbackIndex + 1).padStart(4, "0")}`;
}

function getAdaptationMetric(item: Pick<SavedAnalysisRecord, "adaptationMetric" | "currentDispersion" | "candidateDispersion">) {
  const stored = Number(item.adaptationMetric);
  if (Number.isFinite(stored) && stored !== 0) return stored;
  const current = Number(item.currentDispersion);
  const candidate = Number(item.candidateDispersion);
  return Number.isFinite(current) && Number.isFinite(candidate) ? candidate - current : 0;
}

function HistoricalTrendChart({ items }: { items: SavedAnalysisRecord[] }) {
  const points = items
    .slice()
    .sort((a, b) => (a.epoch || 0) - (b.epoch || 0) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((item, index) => ({
      label: getEpochLabel(item, index),
      adaptation: getAdaptationMetric(item),
      epsilon: Number(item.epsilon),
      accepted: item.decision === "accept",
    }))
    .filter((point) => Number.isFinite(point.adaptation) && Number.isFinite(point.epsilon));

  if (!points.length) return null;

  const width = 760;
  const height = 270;
  const padding = { top: 28, right: 24, bottom: 42, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxAbs = Math.max(0.005, ...points.flatMap((point) => [Math.abs(point.adaptation), Math.abs(point.epsilon)])) * 1.15;
  const x = (index: number) => padding.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const y = (value: number) => padding.top + ((maxAbs - value) / (maxAbs * 2)) * plotHeight;
  const adaptationPolyline = points.map((point, index) => `${x(index)},${y(point.adaptation)}`).join(" ");
  const epsilonPolyline = points.map((point, index) => `${x(index)},${y(point.epsilon)}`).join(" ");
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const latest = points[points.length - 1];
  const peakEpsilon = Math.max(...points.map((point) => point.epsilon));
  const acceptedCount = points.filter((point) => point.accepted).length;

  return (
    <section className="trend-panel" aria-labelledby="adaptation-trend-title">
      <div className="trend-panel-heading">
        <div>
          <span className="mono-label">EPOCH HISTORY / DATABASE DERIVED</span>
          <h5 id="adaptation-trend-title">Adaptation metric over test epochs</h5>
          <p>ΔD = candidate dispersion − current dispersion. The amber trace is the persisted ε barrier used for each saved epoch.</p>
        </div>
        <div className="trend-legend" aria-label="Chart legend">
          <span><i className="trend-key trend-key-cyan" /> ΔD adaptation</span>
          <span><i className="trend-key trend-key-amber" /> ε barrier</span>
        </div>
      </div>
      <div className="trend-chart-wrap">
        <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="adaptation-trend-title adaptation-trend-description">
          <desc id="adaptation-trend-description">Historical adaptation metric and epsilon barrier across {points.length} saved test epochs.</desc>
          {[maxAbs, 0, -maxAbs].map((value) => (
            <g key={value}>
              <line x1={padding.left} x2={width - padding.right} y1={y(value)} y2={y(value)} className={value === 0 ? "trend-zero-line" : "trend-grid-line"} />
              <text x={padding.left - 10} y={y(value) + 4} textAnchor="end" className="trend-axis-label">{value.toFixed(3)}</text>
            </g>
          ))}
          <polyline points={adaptationPolyline} className="trend-line trend-line-cyan" />
          <polyline points={epsilonPolyline} className="trend-line trend-line-amber" />
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle cx={x(index)} cy={y(point.adaptation)} r="4" className="trend-point trend-point-cyan">
                <title>{`${point.label}: ΔD ${point.adaptation.toFixed(5)}`}</title>
              </circle>
              <circle cx={x(index)} cy={y(point.epsilon)} r="3.5" className="trend-point trend-point-amber">
                <title>{`${point.label}: ε ${point.epsilon.toFixed(5)}`}</title>
              </circle>
              {(index === 0 || index === points.length - 1 || index % labelStep === 0) && <text x={x(index)} y={height - 14} textAnchor="middle" className="trend-x-label">{point.label}</text>}
            </g>
          ))}
        </svg>
      </div>
      <div className="trend-summary" aria-label="Historical trend summary">
        <span><b>Latest ΔD</b> {latest.adaptation.toFixed(5)}</span>
        <span><b>Peak ε</b> {peakEpsilon.toFixed(5)}</span>
        <span><b>Accepted</b> {acceptedCount}/{points.length}</span>
      </div>
    </section>
  );
}

const RUST_REFERENCE = {
  nsPerNode: 95.444049,
  totalMs: 95.444049,
  nodes: 10_000,
  iterations: 100,
};

type BenchNode = { theta: number; e: number; ec: number };

function stepBrowserParity(nodes: BenchNode[], edges: { src: number; dst: number; weight: number }[]) {
  const adjacency = Array.from({ length: nodes.length }, () => [] as { src: number; weight: number }[]);
  for (const edge of edges) {
    if (edge.src >= 0 && edge.dst >= 0 && edge.src < nodes.length && edge.dst < nodes.length) adjacency[edge.dst].push({ src: edge.src, weight: edge.weight });
  }
  const neighborSums = adjacency.map((incoming) => incoming.sort((a, b) => a.src - b.src).reduce((sum, edge) => sum + nodes[edge.src].theta * edge.weight, 0));
  return nodes.map((node, index) => {
    const raw = node.ec === 0 ? neighborSums[index] : (node.e - node.ec) / node.ec + neighborSums[index];
    return { theta: Math.tanh(raw), e: node.e, ec: node.ec };
  });
}

function runBrowserParityBenchmark() {
  const nodes = 10_000;
  const iterations = 100;
  const edges = Array.from({ length: nodes - 1 }, (_, index) => ({ src: index, dst: index + 1, weight: 0.1 }));
  let current = Array.from({ length: nodes }, () => ({ theta: 0.1, e: 0.5, ec: 1.0 }));
  for (let warmup = 0; warmup < 10; warmup += 1) current = stepBrowserParity(current, edges);
  const start = performance.now();
  for (let iteration = 0; iteration < iterations; iteration += 1) current = stepBrowserParity(current, edges);
  const browserTotalMs = performance.now() - start;
  const browserNsPerNode = (browserTotalMs * 1_000_000) / (nodes * iterations);
  return { browserNsPerNode, browserTotalMs, rustNsPerNode: RUST_REFERENCE.nsPerNode, nodes, iterations, ratio: browserNsPerNode / RUST_REFERENCE.nsPerNode };
}

function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeExportName(name: string | null | undefined) {
  return (name || "onsour-dispersion-analysis").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "onsour-dispersion-analysis";
}

function escapeSvgText(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function dispersion(nodes: GraphNode[]) {
  if (!nodes.length) return 0;
  const mean = nodes.reduce((sum, node) => sum + node.theta, 0) / nodes.length;
  return nodes.reduce((sum, node) => {
    const delta = node.theta - mean;
    return sum + delta * delta;
  }, 0) / nodes.length;
}

const DEFAULT_GRAPH_DATA: GraphDataset = {
  name: "onsour-sample-epoch-0042",
  currentNodes: [
    { id: "core", theta: 0.1, label: "Kernel Core", tags: ["kernel", "governance"] },
    { id: "governor", theta: 0.18, label: "Thermodynamic Governor", tags: ["kernel", "governance"] },
    { id: "entropy", theta: -0.08, label: "Entropy Field", tags: ["field", "dispersion"] },
    { id: "replay", theta: 0.02, label: "Authoritative Replay", tags: ["replay", "determinism"] },
    { id: "runtime", theta: 0.24, label: "Rust Runtime", tags: ["kernel", "execution"] },
    { id: "memory", theta: -0.14, label: "Memory Field", tags: ["field", "state"] },
    { id: "ethics", theta: 0.11, label: "Ethics Barrier", tags: ["replay", "ethics"] },
    { id: "observer", theta: 0.03, label: "Observer Node", tags: ["replay", "telemetry"] },
  ],
  candidateNodes: [
    { id: "core", theta: 0.12 },
    { id: "governor", theta: 0.22 },
    { id: "entropy", theta: -0.06 },
    { id: "replay", theta: 0.02 },
    { id: "runtime", theta: 0.26 },
    { id: "memory", theta: -0.18 },
    { id: "ethics", theta: 0.13 },
    { id: "observer", theta: 0.04 },
  ],
  edges: [
    { src: "core", dst: "governor", weight: 0.9 },
    { src: "governor", dst: "entropy", weight: 0.7 },
    { src: "governor", dst: "runtime", weight: 0.8 },
    { src: "runtime", dst: "memory", weight: 0.5 },
    { src: "core", dst: "replay", weight: 0.6 },
    { src: "replay", dst: "ethics", weight: 0.4 },
    { src: "ethics", dst: "observer", weight: 0.3 },
  ],
  edgeCount: 7,
};

function makeGraphAnalysis(dataset: GraphDataset): GraphAnalysis {
  return {
    ...dataset,
    currentDispersion: dispersion(dataset.currentNodes),
    candidateDispersion: dispersion(dataset.candidateNodes),
    accepted: false,
  };
}

function parseGraphPayload(payload: unknown): GraphDataset {
  if (!payload || typeof payload !== "object") throw new Error("The JSON root must be an object.");
  const record = payload as Record<string, unknown>;
  const currentRaw = record.current_nodes ?? record.nodes;
  const candidateRaw = record.candidate_nodes ?? record.next_nodes ?? record.next_state;
  if (!Array.isArray(currentRaw) || !Array.isArray(candidateRaw)) throw new Error("Expected current_nodes and candidate_nodes arrays.");
  if (!currentRaw.length || currentRaw.length !== candidateRaw.length) throw new Error("Current and candidate arrays must have the same non-zero length.");
  const parseNodes = (items: unknown[], label: string) => items.map((item, index) => {
    const itemRecord = typeof item === "object" && item !== null ? item as Record<string, unknown> : null;
    const theta = typeof item === "number" ? item : itemRecord?.theta;
    if (typeof theta !== "number" || !Number.isFinite(theta) || theta < -1 || theta > 1) throw new Error(`${label}[${index}].theta must be a finite number in [-1, 1].`);
    const id = itemRecord?.id ?? index;
    const rawLabel = itemRecord?.label ?? itemRecord?.name;
    const rawTags = itemRecord?.tags ?? itemRecord?.labels ?? itemRecord?.groups;
    const tags = Array.isArray(rawTags) ? rawTags.filter((tag): tag is string => typeof tag === "string") : typeof rawTags === "string" ? rawTags.split(/[;,|]/).map((tag) => tag.trim()).filter(Boolean) : undefined;
    return { id: String(id), theta, label: typeof rawLabel === "string" ? rawLabel : undefined, tags: tags?.length ? tags : undefined };
  });
  const edges = Array.isArray(record.edges) ? record.edges.map((edge, index) => {
    if (!edge || typeof edge !== "object") throw new Error(`edges[${index}] must be an object.`);
    const edgeRecord = edge as { src?: unknown; source?: unknown; dst?: unknown; target?: unknown; weight?: unknown };
    const src = edgeRecord.src ?? edgeRecord.source;
    const dst = edgeRecord.dst ?? edgeRecord.target;
    if (src === undefined || dst === undefined) throw new Error(`edges[${index}] must include src and dst endpoints.`);
    const weight = edgeRecord.weight === undefined ? 1 : edgeRecord.weight;
    if (typeof weight !== "number" || !Number.isFinite(weight)) throw new Error(`edges[${index}].weight must be finite.`);
    return { src: String(src), dst: String(dst), weight };
  }) : [];
  const currentNodes = parseNodes(currentRaw, "current_nodes");
  const candidateNodes = parseNodes(candidateRaw, "candidate_nodes");
  if (currentNodes.some((node, index) => candidateNodes[index]?.id !== node.id)) throw new Error("current_nodes and candidate_nodes must use matching node IDs by index.");
  return {
    currentNodes,
    candidateNodes,
    edges,
    edgeCount: edges.length,
    name: typeof record.name === "string" ? record.name : undefined,
  };
}

function NodeStrip({ label, nodes, tone }: { label: string; nodes: GraphNode[]; tone: "cyan" | "amber" }) {
  return (
    <div className="node-strip-block">
      <div className="node-strip-heading"><span className="mono-label">{label}</span><span>{nodes.length} nodes</span></div>
      <div className={`node-strip node-strip-${tone}`}>
        {nodes.slice(0, 80).map((node, index) => <span key={`${label}-${node.id}-${index}`} title={`θ = ${node.theta.toFixed(4)}`} style={{ left: `${Math.min(Math.max((node.theta + 1) * 50, 0), 100)}%` }} />)}
      </div>
      <div className="node-strip-axis"><span>-1</span><span>0</span><span>+1</span></div>
    </div>
  );
}

function NetworkGraphCanvas({ analysis }: { analysis: GraphAnalysis }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const visibleIdsRef = useRef(new Set<string>());
  const viewportRef = useRef({ width: 0, height: 0 });
  const renderRef = useRef<(() => void) | null>(null);
  const gestureRef = useRef<{ mode: "pan" | "node"; lastX: number; lastY: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [focusNode, setFocusNode] = useState("");
  const [depth, setDepth] = useState(1);
  const [groupFilter, setGroupFilter] = useState("all");
  const [colorMode, setColorMode] = useState<"behavior" | "clusters">("clusters");
  const [clusterRules, setClusterRules] = useState<ClusterRule[]>(DEFAULT_CLUSTER_RULES);
  const [showClusterEditor, setShowClusterEditor] = useState(false);
  const [showArrows, setShowArrows] = useState(true);
  const [showOrphans, setShowOrphans] = useState(true);
  const [nodeScale, setNodeScale] = useState(1);
  const [linkScale, setLinkScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [simulationActive, setSimulationActive] = useState(true);
  const simulationActiveRef = useRef(true);
  const pulsePhaseRef = useRef(0);

  useEffect(() => {
    simulationActiveRef.current = simulationActive;
  }, [simulationActive]);

  const getBehaviorColor = (delta: number) => delta > 0.02 ? "#f5b86b" : delta < -0.02 ? "#9be9e0" : "#74f0e4";
  const getClusterRule = (node: GraphNode) => colorMode === "clusters" ? clusterRules.find((rule) => matchesClusterRule(node, rule)) : undefined;
  const getNodeColor = (node: GraphNode, delta: number) => getClusterRule(node)?.color ?? getBehaviorColor(delta);

  useEffect(() => {
    positionsRef.current.clear();
    visibleIdsRef.current.clear();
    setHovered(null);
    setSelected(null);
    setFocusNode("");
    setSearch("");
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [analysis]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nodes = analysis.currentNodes.slice(0, 180);
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const candidateMap = new Map(analysis.candidateNodes.map((node) => [node.id, node]));
    const adjacency = new Map<string, Set<string>>();
    nodes.forEach((node) => adjacency.set(node.id, new Set()));
    analysis.edges.slice(0, 700).forEach((edge) => {
      adjacency.get(edge.src)?.add(edge.dst);
      adjacency.get(edge.dst)?.add(edge.src);
    });

    const getDelta = (node: GraphNode) => (candidateMap.get(node.id)?.theta ?? node.theta) - node.theta;
    const getGroup = (delta: number) => delta > 0.02 ? "increased" : delta < -0.02 ? "decreased" : "stable";
    const getLocalIds = () => {
      if (!focusNode || !nodeMap.has(focusNode)) return null;
      const localIds = new Set([focusNode]);
      let frontier = [focusNode];
      for (let level = 0; level < depth; level += 1) {
        const next: string[] = [];
        frontier.forEach((id) => adjacency.get(id)?.forEach((neighbor) => {
          if (!localIds.has(neighbor)) { localIds.add(neighbor); next.push(neighbor); }
        }));
        frontier = next;
      }
      return localIds;
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 310);
      viewportRef.current = { width, height };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#07131f";
      context.fillRect(0, 0, width, height);

      let positions = positionsRef.current;
      if (positions.size !== nodes.length || nodes.some((node) => !positions.has(node.id))) {
        const radius = Math.min(width, height) * (nodes.length > 42 ? 0.36 : 0.31);
        positions = new Map(nodes.map((node, index) => {
          const angle = -Math.PI / 2 + (index / Math.max(nodes.length, 1)) * Math.PI * 2;
          return [node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }];
        }));
      } else {
        // Run force-directed relaxation steps for organic organic movement
        const k = Math.sqrt((width * height) / Math.max(nodes.length, 1)) * 0.75;
        const currentPos = new Map(positions);
        for (let step = 0; step < 6; step += 1) {
          const disp = new Map<string, { x: number; y: number }>();
          nodes.forEach((n) => disp.set(n.id, { x: 0, y: 0 }));

          // Repulsion
          for (let i = 0; i < nodes.length; i += 1) {
            for (let j = i + 1; j < nodes.length; j += 1) {
              const u = nodes[i];
              const v = nodes[j];
              const p1 = currentPos.get(u.id)!;
              const p2 = currentPos.get(v.id)!;
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.hypot(dx, dy) || 1;
              const rep = (k * k) / dist;
              const du = disp.get(u.id)!;
              const dv = disp.get(v.id)!;
              du.x += (dx / dist) * rep * 0.2;
              du.y += (dy / dist) * rep * 0.2;
              dv.x -= (dx / dist) * rep * 0.2;
              dv.y -= (dy / dist) * rep * 0.2;
            }
          }

          // Attraction along edges
          analysis.edges.forEach((edge) => {
            const p1 = currentPos.get(edge.src);
            const p2 = currentPos.get(edge.dst);
            if (!p1 || !p2) return;
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.hypot(dx, dy) || 1;
            const att = (dist * dist) / k;
            const du = disp.get(edge.src);
            const dv = disp.get(edge.dst);
            if (du && dv) {
              du.x -= (dx / dist) * att * 0.15;
              du.y -= (dy / dist) * att * 0.15;
              dv.x += (dx / dist) * att * 0.15;
              dv.y += (dy / dist) * att * 0.15;
            }
          });

          nodes.forEach((n) => {
            const p = currentPos.get(n.id)!;
            const d = disp.get(n.id)!;
            const len = Math.hypot(d.x, d.y) || 1;
            const capped = Math.min(len, 12);
            p.x += (d.x / len) * capped;
            p.y += (d.y / len) * capped;
          });
        }
        positions = currentPos;
      }
      positionsRef.current = positions;

      const localIds = getLocalIds();
      const query = search.trim().toLowerCase();
      const renderedNodes = nodes.filter((node) => {
        if (localIds && !localIds.has(node.id)) return false;
        if (!showOrphans && (adjacency.get(node.id)?.size ?? 0) === 0 && node.id !== focusNode) return false;
        if (query && !node.id.toLowerCase().includes(query)) return false;
        if (groupFilter !== "all" && getGroup(getDelta(node)) !== groupFilter) return false;
        return true;
      });
      const visibleIds = new Set(renderedNodes.map((node) => node.id));
      visibleIdsRef.current = visibleIds;
      const activeNode = hovered ?? selected;
      const activeNeighbors = new Set<string>();
      if (activeNode) {
        adjacency.get(activeNode)?.forEach((id) => activeNeighbors.add(id));
      }
      const toScreen = (point: { x: number; y: number }) => ({ x: width / 2 + pan.x + point.x * zoom, y: height / 2 + pan.y + point.y * zoom });

      context.lineCap = "round";
      const pulseTime = pulsePhaseRef.current;
      const center = { x: width / 2 + pan.x, y: height / 2 + pan.y };
      const corePulse = simulationActiveRef.current ? 0.5 + 0.5 * Math.sin(pulseTime * 2.2) : 0.35;
      const coreGradient = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, Math.min(width, height) * 0.46);
      coreGradient.addColorStop(0, `rgba(116,240,228,${0.12 + corePulse * 0.08})`);
      coreGradient.addColorStop(0.42, "rgba(42,133,139,0.035)");
      coreGradient.addColorStop(1, "rgba(7,19,31,0)");
      context.fillStyle = coreGradient;
      context.beginPath();
      context.arc(center.x, center.y, Math.min(width, height) * 0.46, 0, Math.PI * 2);
      context.fill();
      analysis.edges.slice(0, 700).forEach((edge, edgeIndex) => {
        const fromWorld = positionsRef.current.get(edge.src);
        const toWorld = positionsRef.current.get(edge.dst);
        if (!fromWorld || !toWorld || !visibleIds.has(edge.src) || !visibleIds.has(edge.dst)) return;
        const from = toScreen(fromWorld);
        const to = toScreen(toWorld);
        const isConnected = !activeNode || edge.src === activeNode || edge.dst === activeNode;
        const stroke = edge.weight < 0 ? "#f5b86b" : "#2a858b";
        context.globalAlpha = isConnected ? 0.7 : 0.1;
        context.strokeStyle = stroke;
        context.lineWidth = Math.max(0.7, Math.min(4.5, Math.abs(edge.weight) * 3 * linkScale));
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
        const edgeDistance = Math.hypot(to.x - from.x, to.y - from.y);
        if (simulationActiveRef.current && isConnected && edgeDistance > 24) {
          const progress = ((pulseTime * (0.1 + Math.min(Math.abs(edge.weight), 1) * 0.12) + edgeIndex * 0.137) % 1 + 1) % 1;
          const particle = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
          context.globalAlpha = 0.75;
          context.fillStyle = edge.weight < 0 ? "#ffd79b" : "#c6fff8";
          context.shadowBlur = 10;
          context.shadowColor = context.fillStyle;
          context.beginPath();
          context.arc(particle.x, particle.y, 2.2 + Math.abs(edge.weight), 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
        if (showArrows && edgeDistance > 20) {
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          const arrowLength = 7 + linkScale * 2;
          context.globalAlpha = isConnected ? 0.82 : 0.1;
          context.fillStyle = stroke;
          context.beginPath();
          context.moveTo(to.x, to.y);
          context.lineTo(to.x - Math.cos(angle - 0.45) * arrowLength, to.y - Math.sin(angle - 0.45) * arrowLength);
          context.lineTo(to.x - Math.cos(angle + 0.45) * arrowLength, to.y - Math.sin(angle + 0.45) * arrowLength);
          context.closePath();
          context.fill();
        }
      });
      context.globalAlpha = 1;

      renderedNodes.forEach((node, nodeIndex) => {
        const world = positionsRef.current.get(node.id);
        if (!world) return;
        const point = toScreen(world);
        const delta = getDelta(node);
        const color = getNodeColor(node, delta);
        const isActive = activeNode === node.id;
        const isNeighbor = activeNeighbors.has(node.id);
        const isDimmed = Boolean(activeNode) && !isActive && !isNeighbor;
        const nodePulse = simulationActiveRef.current ? 0.5 + 0.5 * Math.sin(pulseTime * 2.4 + nodeIndex * 0.72) : 0.35;
        const nodeRadius = (4 + Math.min(Math.abs(delta) * 16, 3)) * nodeScale * (isActive ? 1.55 : 1) * (1 + nodePulse * 0.08);
        context.globalAlpha = isDimmed ? 0.2 : 1;
        if (!isDimmed && (simulationActiveRef.current || isActive)) {
          context.strokeStyle = color;
          context.lineWidth = 1;
          context.globalAlpha = isDimmed ? 0.06 : 0.16 + nodePulse * 0.1;
          context.beginPath();
          context.arc(point.x, point.y, nodeRadius + 7 + nodePulse * 8, 0, Math.PI * 2);
          context.stroke();
        }
        context.globalAlpha = isDimmed ? 0.2 : 1;
        context.beginPath();
        context.fillStyle = color;
        context.shadowBlur = isActive ? 22 + nodePulse * 8 : 12 + nodePulse * 6;
        context.shadowColor = color;
        context.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        if (isActive || selected === node.id || focusNode === node.id) {
          context.strokeStyle = "#effffc";
          context.lineWidth = 1;
          context.stroke();
          context.fillStyle = "#effffc";
          context.font = "10px IBM Plex Mono, monospace";
          context.fillText(`${node.id}  θ=${node.theta.toFixed(3)}`, point.x + 11, point.y - 9);
        }
      });
      context.globalAlpha = 1;

      if (!renderedNodes.length) {
        context.fillStyle = "#8faab7";
        context.font = "10px IBM Plex Mono, monospace";
        context.textAlign = "center";
        context.fillText("NO NODES MATCH THE CURRENT GRAPH FILTER", width / 2, height / 2);
        context.textAlign = "start";
      } else if (!analysis.edges.length) {
        context.fillStyle = "#8faab7";
        context.font = "10px IBM Plex Mono, monospace";
        context.textAlign = "center";
        context.fillText("NODE FIELD / NO EDGE DATA", width / 2, height - 28);
        context.textAlign = "start";
      }
    };
    renderRef.current = render;
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      renderRef.current = null;
    };
  }, [analysis, clusterRules, colorMode, depth, focusNode, groupFilter, hovered, linkScale, nodeScale, pan, search, selected, showArrows, showOrphans, zoom]);

  useEffect(() => {
    let frame = 0;
    const tick = (time: number) => {
      if (simulationActiveRef.current) {
        pulsePhaseRef.current = time / 1000;
        renderRef.current?.();
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const screenPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const hitTest = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = screenPoint(event);
    const { width, height } = viewportRef.current;
    let closest: string | null = null;
    let distance = 16;
    positionsRef.current.forEach((world, id) => {
      if (!visibleIdsRef.current.has(id)) return;
      const candidateDistance = Math.hypot(width / 2 + pan.x + world.x * zoom - point.x, height / 2 + pan.y + world.y * zoom - point.y);
      if (candidateDistance < distance) { distance = candidateDistance; closest = id; }
    });
    return closest;
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const gesture = gestureRef.current;
    if (gesture?.mode === "pan") {
      const dx = event.clientX - gesture.lastX;
      const dy = event.clientY - gesture.lastY;
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
      setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
      return;
    }
    setHovered(hitTest(event));
  };
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const node = hitTest(event);
    if (node) {
      setSelected(node);
      gestureRef.current = { mode: "node", lastX: event.clientX, lastY: event.clientY };
    } else {
      gestureRef.current = { mode: "pan", lastX: event.clientX, lastY: event.clientY };
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    gestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const selectedNode = selected ? analysis.currentNodes.find((node) => node.id === selected) ?? null : null;
  const selectedCandidate = selectedNode ? analysis.candidateNodes.find((node) => node.id === selectedNode.id) : undefined;
  const selectedDelta = selectedNode && selectedCandidate ? selectedCandidate.theta - selectedNode.theta : 0;
  const selectedEdges = selectedNode ? analysis.edges.filter((edge) => edge.src === selectedNode.id || edge.dst === selectedNode.id) : [];
  const selectedIncoming = selectedEdges.filter((edge) => edge.dst === selectedNode?.id);
  const selectedOutgoing = selectedEdges.filter((edge) => edge.src === selectedNode?.id);
  const selectedNeighbors = Array.from(new Set(selectedEdges.map((edge) => edge.src === selectedNode?.id ? edge.dst : edge.src)));
  const selectedGroup = selectedNode ? (selectedDelta > 0.02 ? "θ increased" : selectedDelta < -0.02 ? "θ decreased" : "stable / neutral") : "";
  const selectedColor = selectedDelta > 0.02 ? "#f5b86b" : selectedDelta < -0.02 ? "#9be9e0" : "#74f0e4";
  const selectedClusterRule = selectedNode ? getClusterRule(selectedNode) : undefined;
  const selectedDisplayColor = selectedClusterRule?.color ?? selectedColor;
  const meanTheta = analysis.currentNodes.length ? analysis.currentNodes.reduce((sum, node) => sum + node.theta, 0) / analysis.currentNodes.length : 0;
  const meanDelta = analysis.currentNodes.length ? analysis.currentNodes.reduce((sum, node) => sum + ((analysis.candidateNodes.find((candidate) => candidate.id === node.id)?.theta ?? node.theta) - node.theta), 0) / analysis.currentNodes.length : 0;
  const governanceLabel = analysis.accepted ? "ACCEPT STATE" : "ATOMIC ROLLBACK";
  const topologyDensity = analysis.currentNodes.length > 1 ? analysis.edges.length / (analysis.currentNodes.length * (analysis.currentNodes.length - 1)) : 0;

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeExportName(analysis.name ?? "onsour-graph")}-graph.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const exportSvg = () => {
    const { width, height } = viewportRef.current;
    if (!width || !height) return;
    const nodes = analysis.currentNodes.slice(0, 180);
    const candidateMap = new Map(analysis.candidateNodes.map((node) => [node.id, node]));
    const visibleIds = visibleIdsRef.current.size ? visibleIdsRef.current : new Set(nodes.map((node) => node.id));
    const activeNode = hovered ?? selected;
    const activeNeighbors = new Set<string>();
    if (activeNode) analysis.edges.forEach((edge) => { if (edge.src === activeNode) activeNeighbors.add(edge.dst); if (edge.dst === activeNode) activeNeighbors.add(edge.src); });
    const getDelta = (node: GraphNode) => (candidateMap.get(node.id)?.theta ?? node.theta) - node.theta;
    const toScreen = (point: { x: number; y: number }) => ({ x: width / 2 + pan.x + point.x * zoom, y: height / 2 + pan.y + point.y * zoom });
    const svg: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width)}" height="${Math.round(height)}" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}">`, `<title>${escapeSvgText(analysis.name ?? "ONSOUR graph")}</title>`, `<desc>ONSOUR Graph Explorer export with ${visibleIds.size} visible nodes and ${analysis.edges.length} source edges.</desc>`, `<defs><marker id="onsour-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2a858b" /></marker></defs>`, `<rect width="100%" height="100%" fill="#07131f" />`];
    analysis.edges.slice(0, 700).forEach((edge) => {
      const fromWorld = positionsRef.current.get(edge.src);
      const toWorld = positionsRef.current.get(edge.dst);
      if (!fromWorld || !toWorld || !visibleIds.has(edge.src) || !visibleIds.has(edge.dst)) return;
      const from = toScreen(fromWorld);
      const to = toScreen(toWorld);
      const connected = !activeNode || edge.src === activeNode || edge.dst === activeNode;
      const stroke = edge.weight < 0 ? "#f5b86b" : "#2a858b";
      svg.push(`<line x1="${from.x.toFixed(2)}" y1="${from.y.toFixed(2)}" x2="${to.x.toFixed(2)}" y2="${to.y.toFixed(2)}" stroke="${stroke}" stroke-width="${Math.max(0.7, Math.min(4.5, Math.abs(edge.weight) * 3 * linkScale)).toFixed(2)}" opacity="${connected ? "0.65" : "0.12"}"${showArrows ? ' marker-end="url(#onsour-arrow)"' : ""} />`);
    });
    nodes.forEach((node) => {
      if (!visibleIds.has(node.id)) return;
      const world = positionsRef.current.get(node.id);
      if (!world) return;
      const point = toScreen(world);
      const delta = getDelta(node);
      const isActive = activeNode === node.id;
      const isDimmed = Boolean(activeNode) && !isActive && !activeNeighbors.has(node.id);
      const radius = (4 + Math.min(Math.abs(delta) * 16, 3)) * nodeScale * (isActive ? 1.55 : 1);
      const color = getNodeColor(node, delta);
      svg.push(`<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}" opacity="${isDimmed ? "0.2" : "1"}" />`);
      if (isActive || selected === node.id || focusNode === node.id) svg.push(`<text x="${(point.x + 11).toFixed(2)}" y="${(point.y - 9).toFixed(2)}" fill="#effffc" font-family="IBM Plex Mono, monospace" font-size="10">${escapeSvgText(`${node.id} θ=${node.theta.toFixed(3)}`)}</text>`);
    });
    svg.push("</svg>");
    downloadText(svg.join(""), `${safeExportName(analysis.name ?? "onsour-graph")}-graph.svg`, "image/svg+xml;charset=utf-8");
  };

  const addClusterRule = () => setClusterRules((rules) => [...rules, { id: `cluster-${Date.now()}`, label: "New cluster", pattern: "", color: "#d7a8ff" }]);
  const updateClusterRule = (id: string, patch: Partial<ClusterRule>) => setClusterRules((rules) => rules.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));
  const removeClusterRule = (id: string) => setClusterRules((rules) => rules.filter((rule) => rule.id !== id));
  const moveClusterRule = (id: string, direction: -1 | 1) => setClusterRules((rules) => {
    const index = rules.findIndex((rule) => rule.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rules.length) return rules;
    const reordered = rules.slice();
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    return reordered;
  });
  const clusterMatchCount = (rule: ClusterRule) => analysis.currentNodes.filter((node) => matchesClusterRule(node, rule)).length;

  return (
    <div className="network-canvas-wrap">
      <div className="network-canvas-heading network-showcase-heading"><div><span className="network-live-kicker"><i className="network-live-beacon" /> LIVING ECOSYSTEM / UIPT GOVERNANCE</span><strong>Where state becomes signal.</strong><p>Watch energy move through the topology, then see the thermodynamic governor preserve coherent change.</p></div><div className="network-showcase-aside"><span className="network-canvas-hint">Hover to focus · click to select · drag field to pan</span><span className={`network-showcase-status ${analysis.accepted ? "is-accepted" : "is-rollback"}`}><i /> {governanceLabel}</span></div></div>
      <div className="network-showcase-hud" aria-label="Live graph showcase metrics">
        <div className="network-hud-metric"><span className="mono-label">STATE DISPERSION</span><strong>{analysis.currentDispersion.toFixed(5)}</strong><small>system order field</small></div>
        <div className="network-hud-metric"><span className="mono-label">MEAN Δθ</span><strong className={meanDelta >= 0 ? "hud-amber" : "hud-mint"}>{meanDelta >= 0 ? "+" : ""}{meanDelta.toFixed(4)}</strong><small>candidate movement</small></div>
        <div className="network-hud-metric"><span className="mono-label">MEAN θ</span><strong>{meanTheta.toFixed(3)}</strong><small>activation center</small></div>
        <div className="network-hud-metric"><span className="mono-label">RUST RAYON BENCH</span><strong className="hud-mint">95.44 ns</strong><small>10k node chain ref</small></div>
        <button type="button" className={`network-simulation-toggle ${simulationActive ? "is-live" : ""}`} onClick={() => setSimulationActive((active) => !active)} aria-pressed={simulationActive}><span className="simulation-toggle-orbit" /><span><span className="mono-label">SIMULATION & PULSE</span><strong>{simulationActive ? "LIVE" : "PAUSED"}</strong></span><ChevronRight size={14} /></button>
      </div>
      <div className="network-graph-controls">
        <label><span className="mono-label">SEARCH NODES</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="id contains…" /></label>
        <label><span className="mono-label">LOCAL GRAPH FOCUS</span><select value={focusNode} onChange={(event) => setFocusNode(event.target.value)}><option value="">Global graph</option>{analysis.currentNodes.slice(0, 180).map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}</select></label>
        <label><span className="mono-label">DEPTH {depth}</span><input type="range" min="1" max="4" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} disabled={!focusNode} /></label>
        <label><span className="mono-label">GROUP</span><select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}><option value="all">All node groups</option><option value="stable">Stable / neutral</option><option value="increased">θ increased</option><option value="decreased">θ decreased</option></select></label>
        <label><span className="mono-label">NODE SCALE</span><input type="range" min="0.7" max="1.8" step="0.1" value={nodeScale} onChange={(event) => setNodeScale(Number(event.target.value))} /></label>
        <label><span className="mono-label">LINK SCALE</span><input type="range" min="0.5" max="2" step="0.1" value={linkScale} onChange={(event) => setLinkScale(Number(event.target.value))} /></label>
        <label className="network-check"><input type="checkbox" checked={showArrows} onChange={(event) => setShowArrows(event.target.checked)} /> arrows</label>
        <label className="network-check"><input type="checkbox" checked={showOrphans} onChange={(event) => setShowOrphans(event.target.checked)} /> orphans</label>
        <div className="network-zoom-controls"><button type="button" onClick={() => setZoom((value) => Math.min(2.5, value + 0.15))} aria-label="Zoom in">+</button><span>{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((value) => Math.max(0.5, value - 0.15))} aria-label="Zoom out">−</button><button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} aria-label="Reset graph view">reset</button></div>
        <div className="network-export-controls" aria-label="Export current graph view"><span className="mono-label">EXPORT VIEW</span><button type="button" onClick={exportPng} title="Download current graph view as PNG" aria-label="Download current graph view as PNG"><Download size={12} /> PNG</button><button type="button" onClick={exportSvg} title="Download current graph view as SVG" aria-label="Download current graph view as SVG"><Download size={12} /> SVG</button></div>
      </div>
      <div className="cluster-color-bar" aria-label="Custom cluster coloring"><div className="cluster-color-mode"><span className="mono-label">COLOR LAYER</span><button type="button" className={colorMode === "behavior" ? "is-active" : ""} onClick={() => setColorMode("behavior")}>θ behavior</button><button type="button" className={colorMode === "clusters" ? "is-active" : ""} onClick={() => setColorMode("clusters")}>custom clusters</button></div><div className="cluster-chip-list">{clusterRules.map((rule, index) => <span className={`cluster-chip ${colorMode === "clusters" ? "is-active" : ""}`} key={rule.id}><i style={{ background: rule.color }} />{rule.label}<b>{clusterMatchCount(rule)}</b><small>priority {index + 1}</small></span>)}</div><button type="button" className="cluster-edit-trigger" onClick={() => setShowClusterEditor((open) => !open)}>{showClusterEditor ? "close rules" : "edit rules"}</button></div>
      {showClusterEditor && <div className="cluster-rule-editor"><div className="cluster-editor-heading"><div><span className="mono-label">CLUSTER RULES / FIRST MATCH WINS</span><p>Match node IDs, labels, or tags with plain text or regular expressions. The first matching rule wins; use the arrows to change precedence.</p></div><button type="button" className="cluster-add-button" onClick={addClusterRule}>+ add rule</button></div><div className="cluster-rule-list">{clusterRules.map((rule, index) => <div className="cluster-rule-row" key={rule.id}><span className="cluster-rule-priority">{index + 1}</span><span className="cluster-rule-reorder"><button type="button" onClick={() => moveClusterRule(rule.id, -1)} disabled={index === 0} aria-label={`Move ${rule.label} rule up`} title="Move rule up">↑</button><button type="button" onClick={() => moveClusterRule(rule.id, 1)} disabled={index === clusterRules.length - 1} aria-label={`Move ${rule.label} rule down`} title="Move rule down">↓</button></span><input className="cluster-rule-color" type="color" value={rule.color} onChange={(event) => updateClusterRule(rule.id, { color: event.target.value })} aria-label={`${rule.label} color`} /><input className="cluster-rule-label" value={rule.label} onChange={(event) => updateClusterRule(rule.id, { label: event.target.value })} aria-label="Cluster label" placeholder="Cluster label" /><input className="cluster-rule-pattern" value={rule.pattern} onChange={(event) => updateClusterRule(rule.id, { pattern: event.target.value })} aria-label="Cluster matching pattern" placeholder="regex: kernel|core" /><span className="cluster-rule-count">{clusterMatchCount(rule)} match{clusterMatchCount(rule) === 1 ? "" : "es"}</span><button type="button" className="cluster-rule-remove" onClick={() => removeClusterRule(rule.id)} aria-label={`Remove ${rule.label} rule`}>×</button></div>)}</div></div>}
      <div className="network-graph-stage">
        <div className="network-canvas-column">
          <canvas ref={canvasRef} className="network-canvas" onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onPointerLeave={() => { if (!gestureRef.current) setHovered(null); }} tabIndex={0} aria-label="Interactive uploaded graph network canvas" />
        </div>
        <aside className={`node-detail-panel ${selectedNode ? "node-detail-panel-active" : ""}`} aria-label="Selected node details">
          {selectedNode ? (
            <>
              <div className="node-detail-header"><div><span className="mono-label">NODE DETAIL / SELECTED</span><h4 style={{ color: selectedDisplayColor }}>{selectedNode.label ?? selectedNode.id}</h4><small className="node-detail-id">{selectedNode.id}</small></div><button type="button" className="node-detail-close" onClick={() => setSelected(null)} aria-label="Close selected node details">×</button></div>
              <div className="node-detail-status"><span className="node-detail-status-dot" style={{ background: selectedDisplayColor, boxShadow: `0 0 10px ${selectedDisplayColor}` }} />{selectedClusterRule ? selectedClusterRule.label : selectedGroup}<span className="node-detail-status-separator">·</span>{selectedGroup}<span className="node-detail-status-separator">·</span>{focusNode === selectedNode.id ? "local focus active" : "click a node to inspect"}</div>
              <div className="node-detail-metrics">
                <div><span className="mono-label">CURRENT θ</span><strong>{selectedNode.theta.toFixed(4)}</strong></div>
                <div><span className="mono-label">CANDIDATE θ</span><strong>{selectedCandidate?.theta.toFixed(4) ?? "—"}</strong></div>
                <div><span className="mono-label">Δθ</span><strong className={selectedDelta > 0.02 ? "metric-positive" : selectedDelta < -0.02 ? "metric-negative" : ""}>{selectedDelta >= 0 ? "+" : ""}{selectedDelta.toFixed(4)}</strong></div>
                <div><span className="mono-label">DEGREE</span><strong>{selectedEdges.length}</strong></div>
              </div>
              <div className="node-detail-edges"><div><span className="mono-label">INCOMING</span><strong>{selectedIncoming.length} <small>edges</small></strong><span>{selectedIncoming.reduce((sum, edge) => sum + Math.abs(edge.weight), 0).toFixed(3)} weighted</span></div><div><span className="mono-label">OUTGOING</span><strong>{selectedOutgoing.length} <small>edges</small></strong><span>{selectedOutgoing.reduce((sum, edge) => sum + Math.abs(edge.weight), 0).toFixed(3)} weighted</span></div></div>
              <div className="node-detail-neighbors"><span className="mono-label">CONNECTED NEIGHBORS / {selectedNeighbors.length}</span>{selectedNeighbors.length ? <div className="node-neighbor-list">{selectedNeighbors.map((neighbor) => <button key={neighbor} type="button" onClick={() => { setSelected(neighbor); setFocusNode(neighbor); }}>{neighbor}<ChevronRight size={12} /></button>)}</div> : <span className="node-detail-muted">No connected neighbors in the uploaded edge list.</span>}</div>
              <button type="button" className="node-detail-focus-button" onClick={() => setFocusNode(selectedNode.id)}><Workflow size={14} /> Focus this node locally</button>
            </>
          ) : (
            <div className="node-detail-empty"><span className="node-detail-empty-mark">＋</span><span className="mono-label">NODE DETAIL / READY</span><strong>Click any node to inspect it.</strong><p>θ values, adaptation, connectivity, weighted edges, and neighboring nodes will appear here.</p></div>
          )}
        </aside>
      </div>
      <div className="network-legend"><span><i className="legend-dot legend-cyan" /> stable / neutral</span><span><i className="legend-dot legend-amber" /> candidate θ increased</span><span><i className="legend-dot legend-mint" /> candidate θ decreased</span><span><i className="legend-line" /> weighted directed edge</span>{colorMode === "clusters" && clusterRules.map((rule) => <span key={rule.id}><i className="legend-dot" style={{ background: rule.color, boxShadow: `0 0 8px ${rule.color}` }} /> {rule.label}</span>)}<span className="network-legend-note">Color layer: {colorMode === "clusters" ? "custom cluster rules, first match wins" : "θ behavior groups"}. ONSOUR values remain UIPT-derived.</span></div>
    </div>
  );
}

function LiveDispersionLab({ copiedCode, copyToClipboard }: { copiedCode: string | null; copyToClipboard: (text: string, id: string) => void }) {
  const [epsilon, setEpsilon] = useState(0.02);
  const [analysis, setAnalysis] = useState<GraphAnalysis | null>(() => makeGraphAnalysis(DEFAULT_GRAPH_DATA));
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>("Built-in sample graph");
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const schema = `{
  "name": "epoch-0042",
  "current_nodes": [{ "id": "n0", "theta": 0.1 }],
  "candidate_nodes": [{ "id": "n0", "theta": 0.12 }],
  "edges": [{ "src": "n0", "dst": "n1", "weight": 0.1 }]
}`;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseGraphPayload(JSON.parse(String(reader.result)));
        setAnalysis({ ...parsed, currentDispersion: dispersion(parsed.currentNodes), candidateDispersion: dispersion(parsed.candidateNodes), accepted: false });
      } catch (err) {
        setAnalysis(null);
        setError(err instanceof Error ? err.message : "Unable to read this graph file.");
      }
    };
    reader.onerror = () => setError("The file could not be read in the browser.");
    reader.readAsText(file);
  };

  const decision = analysis ? analysis.candidateDispersion <= analysis.currentDispersion + epsilon && Number.isFinite(analysis.candidateDispersion) : false;
  const threshold = analysis ? analysis.currentDispersion + epsilon : 0;
  const analysisName = analysis?.name ?? fileName ?? "Custom Uploaded Graph";
  const epochMatch = analysisName.match(/epoch[-_ ]?(\d+)/i);
  const epoch = epochMatch ? Number(epochMatch[1]) : 0;
  const adaptationMetric = analysis ? analysis.candidateDispersion - analysis.currentDispersion : 0;
  const schemaId = "graph-schema";
  const loadSampleGraph = () => {
    setError(null);
    setFileName("Built-in sample graph");
    setAnalysis(makeGraphAnalysis(DEFAULT_GRAPH_DATA));
  };
  const runBenchmark = () => {
    setBenchmarkRunning(true);
    window.setTimeout(() => {
      setBenchmark(runBrowserParityBenchmark());
      setBenchmarkRunning(false);
    }, 20);
  };

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const savedListQuery = trpc.analysis.list.useQuery();
  const saveMutation = trpc.analysis.save.useMutation({
    onSuccess: () => {
      setSaveStatus("Saved to database successfully.");
      utils.analysis.list.invalidate();
      setTimeout(() => setSaveStatus(null), 3000);
    },
    onError: (err) => {
      setSaveStatus(`Save failed: ${err.message}`);
    },
  });

  const handleSaveToDatabase = () => {
    if (!analysis) return;
    const rows = analysis.currentNodes.map((node, index) => ({
      index,
      id: node.id,
      current_theta: node.theta,
      candidate_theta: analysis.candidateNodes[index]?.theta ?? "",
      delta_theta: (analysis.candidateNodes[index]?.theta ?? node.theta) - node.theta,
    }));
    const payload = {
      schema_version: "onsour.dispersion.v1",
      exported_at: new Date().toISOString(),
      epoch,
      graph: { name: analysisName, node_count: analysis.currentNodes.length, edge_count: analysis.edgeCount, edges: analysis.edges },
      current_nodes: analysis.currentNodes,
      candidate_nodes: analysis.candidateNodes,
      governance: { epsilon, current_dispersion: analysis.currentDispersion, candidate_dispersion: analysis.candidateDispersion, adaptation_metric: adaptationMetric, threshold: analysis.currentDispersion + epsilon, decision: decision ? "accept" : "rollback" },
      benchmark: benchmark ? { browser_ns_per_node: benchmark.browserNsPerNode, rust_rayon_ns_per_node: benchmark.rustNsPerNode, browser_to_rust_ratio: benchmark.ratio, nodes: benchmark.nodes, iterations: benchmark.iterations } : null,
      nodes: rows,
    };
    saveMutation.mutate({
      epoch,
      name: analysisName,
      nodeCount: analysis.currentNodes.length,
      edgeCount: analysis.edgeCount,
      currentDispersion: analysis.currentDispersion.toString(),
      candidateDispersion: analysis.candidateDispersion.toString(),
      epsilon: epsilon.toString(),
      adaptationMetric: adaptationMetric.toString(),
      decision: decision ? "accept" : "rollback",
      payloadJson: JSON.stringify(payload),
    });
  };

  const exportAnalysis = (format: "json" | "csv") => {
    if (!analysis) return;
    const rows = analysis.currentNodes.map((node, index) => ({
      index,
      id: node.id,
      current_theta: node.theta,
      candidate_theta: analysis.candidateNodes[index]?.theta ?? "",
      delta_theta: (analysis.candidateNodes[index]?.theta ?? node.theta) - node.theta,
    }));
    const payload = {
      schema_version: "onsour.dispersion.v1",
      exported_at: new Date().toISOString(),
      epoch,
      graph: { name: analysisName, node_count: analysis.currentNodes.length, edge_count: analysis.edgeCount, edges: analysis.edges },
      current_nodes: analysis.currentNodes,
      candidate_nodes: analysis.candidateNodes,
      governance: { epsilon, current_dispersion: analysis.currentDispersion, candidate_dispersion: analysis.candidateDispersion, adaptation_metric: adaptationMetric, threshold: analysis.currentDispersion + epsilon, decision: decision ? "accept" : "rollback" },
      benchmark: benchmark ? { browser_ns_per_node: benchmark.browserNsPerNode, rust_rayon_ns_per_node: benchmark.rustNsPerNode, browser_to_rust_ratio: benchmark.ratio, nodes: benchmark.nodes, iterations: benchmark.iterations } : null,
      nodes: rows,
    };
    const baseName = safeExportName(analysisName);
    if (format === "json") {
      downloadText(JSON.stringify(payload, null, 2), `${baseName}-dispersion.json`, "application/json;charset=utf-8");
      return;
    }
    const csvRows = [
      "epoch,index,id,current_theta,candidate_theta,delta_theta,current_dispersion,candidate_dispersion,adaptation_metric,epsilon,threshold,decision",
      ...rows.map((row) => [epoch, row.index, row.id, row.current_theta, row.candidate_theta, row.delta_theta, analysis.currentDispersion, analysis.candidateDispersion, adaptationMetric, epsilon, analysis.currentDispersion + epsilon, decision ? "accept" : "rollback"].join(",")),
    ];
    downloadText(csvRows.join("\n"), `${baseName}-dispersion.csv`, "text/csv;charset=utf-8");
  };

  return (
    <div className="graph-lab-shell">
      <div className="graph-lab-topline"><span className="mono-label">BROWSER-SIDE ANALYSIS / NO UPLOAD</span><span className="graph-live-dot" /> Local only</div>
      <div className="graph-lab-intro"><div><h3>Test the dispersion filter live.</h3><p>Start with the built-in graph below, upload your own JSON topology, tune ε, and observe the exact accept-or-rollback rule used by the governance layer.</p></div><div className="graph-intro-actions"><label className="upload-button"><input type="file" accept="application/json,.json" onChange={handleFile} /> <Zap size={15} /> Upload / replace graph</label><button type="button" className="sample-graph-button" onClick={loadSampleGraph}><Workflow size={15} /> View sample topology</button></div></div>
      <div className="graph-schema-row"><code>{`{ current_nodes: [{ id, theta }], candidate_nodes: [{ id, theta }], edges: [{ src, dst, weight }] }`}</code><button onClick={() => copyToClipboard(schema, schemaId)}>{copiedCode === schemaId ? <Check size={14} /> : <Copy size={14} />} {copiedCode === schemaId ? "Copied" : "Copy schema"}</button></div>
      {error && <div className="graph-error"><ShieldCheck size={16} /><span>{error}</span></div>}
      {!analysis && !error && <div className="graph-empty"><FileText size={21} /><strong>Awaiting a graph file</strong><span>Nothing leaves this browser. The accepted schema is shown above.</span></div>}
      {analysis && <div className="graph-lab-grid">
        <div className="graph-controls">
          <div className="graph-file-meta"><span className="mono-label">LOADED GRAPH</span><strong>{analysis.name ?? fileName}</strong><span>{analysis.currentNodes.length} nodes · {analysis.edgeCount} edges</span></div>
          <label className="epsilon-control"><span><span className="mono-label">EPSILON THRESHOLD</span><b>{epsilon.toFixed(3)}</b></span><input type="range" min="0.005" max="0.25" step="0.001" value={epsilon} onChange={(event) => setEpsilon(Number(event.target.value))} /></label>
          <div className={`decision-badge ${decision ? "decision-accepted" : "decision-rollback"}`}><span>{decision ? "ACCEPT STATE" : "ATOMIC ROLLBACK"}</span><strong>{decision ? "Candidate remains within the governance barrier." : "Candidate is restored to the current stable state."}</strong></div>
          <div className="graph-metric-pair"><div><span className="mono-label">CURRENT D(S)</span><strong>{analysis.currentDispersion.toFixed(5)}</strong></div><div><span className="mono-label">CANDIDATE D(S)</span><strong>{analysis.candidateDispersion.toFixed(5)}</strong></div></div>
          <div className="export-block"><span className="mono-label">PERSISTENCE & EXPORT</span><p>Save analysis records to the managed database or export locally.</p><div className="export-actions"><button onClick={handleSaveToDatabase} disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Database size={14} /> {saveMutation.isPending ? "Saving…" : "Save to DB"}</button><button onClick={() => exportAnalysis("json")}><Download size={14} /> JSON</button><button onClick={() => exportAnalysis("csv")}><Download size={14} /> CSV</button></div>{saveStatus && <div className="save-status-msg" role="status" aria-live="polite">{saveStatus}</div>}</div>
        </div>
        <div className="graph-visual">
          <div className="graph-visual-header"><span className="mono-label">STATE SPACE / θ DISTRIBUTION</span><span>threshold {threshold.toFixed(5)}</span></div>
          <NodeStrip label="STATE(t)" nodes={analysis.currentNodes} tone="cyan" />
          <NodeStrip label="CANDIDATE(t+1)" nodes={analysis.candidateNodes} tone="amber" />
          <div className="dispersion-meter"><div className="meter-label"><span className="mono-label">DISPERSION DELTA</span><strong>{(analysis.candidateDispersion - analysis.currentDispersion).toFixed(5)}</strong></div><div className="meter-track"><span style={{ width: `${Math.min(Math.max((analysis.candidateDispersion / Math.max(threshold, 0.00001)) * 100, 0), 100)}%` }} /><i style={{ left: `${Math.min(Math.max((analysis.currentDispersion / Math.max(threshold, 0.00001)) * 100, 0), 100)}%` }} /></div><div className="meter-legend"><span>current</span><span>epsilon barrier</span></div></div>
        </div>
      </div>}
      {analysis && <div className="network-canvas-panel"><div className="network-canvas-panel-intro"><div><span className="mono-label">07 / NETWORK FIELD / GRAPH EXPLORER</span><h3>Explore nodes and connections.</h3><p>The interactive canvas is ready with the built-in sample topology. Use local focus, depth, groups, arrows, zoom, and pan—or load your own JSON graph above.</p></div><span className="network-local-note"><ShieldCheck size={14} /> rendered locally</span></div><NetworkGraphCanvas analysis={analysis} /></div>}
      <div className="benchmark-panel">
        <div className="benchmark-panel-heading"><div><span className="mono-label">CARGO / RAYON PARITY CHECK</span><h4>Same workload. Two runtimes.</h4><p>Rust reference: 10,000 nodes, 100 measured epochs, 10 warmups, release profile. Click to time the equivalent single-threaded browser preview on this device.</p></div><button className="benchmark-run-button" onClick={runBenchmark} disabled={benchmarkRunning}>{benchmarkRunning ? "Running…" : "Run browser parity"} <Gauge size={15} /></button></div>
        <div className="benchmark-provenance"><span><strong>Rust / Rayon</strong> 95.44 ns/node/epoch</span><span><strong>Fixture</strong> deterministic chain · edge weight 0.1</span><span><strong>Source</strong> benchmark_metrics.rs</span></div>
        {benchmark && <div className="benchmark-results"><div className="benchmark-stat benchmark-stat-browser"><span className="mono-label">BROWSER PREVIEW</span><strong>{benchmark.browserNsPerNode.toFixed(2)} <small>ns/node</small></strong><span>{benchmark.browserTotalMs.toFixed(2)} ms total</span></div><div className="benchmark-stat benchmark-stat-rust"><span className="mono-label">RUST / RAYON REFERENCE</span><strong>{benchmark.rustNsPerNode.toFixed(2)} <small>ns/node</small></strong><span>{RUST_REFERENCE.totalMs.toFixed(2)} ms total</span></div><div className="benchmark-ratio"><span className="mono-label">RELATIVE COST</span><strong>{benchmark.ratio.toFixed(1)}×</strong><span>Browser preview / Rust reference</span></div></div>}
        <div className="benchmark-note"><ShieldCheck size={14} /><span>Interpretation: the Rust figure is a release-profile systems measurement; the browser figure is a local single-threaded preview. They share the workload and algorithmic shape, but they are not interchangeable deployment metrics.</span></div>
      </div>
      <div className="saved-analyses-panel">
        <div className="saved-analyses-header"><div><span className="mono-label">DATABASE PERSISTENCE FEED</span><h4>Persisted graph analyses</h4></div><span>{savedListQuery.data?.length ?? 0} records stored in MySQL</span></div>
        {savedListQuery.isLoading && <div className="saved-empty" role="status">Loading persisted records…</div>}
        {savedListQuery.isError && <div className="saved-empty saved-error" role="alert">The database feed could not be loaded. Try refreshing the page.</div>}
        {savedListQuery.data && savedListQuery.data.length === 0 && <div className="saved-empty">No analyses saved to the database yet. Upload a graph and click 'Save to DB'.</div>}
        {savedListQuery.data && savedListQuery.data.length > 0 && <HistoricalTrendChart items={savedListQuery.data as SavedAnalysisRecord[]} />}
        {savedListQuery.data && savedListQuery.data.length > 0 && (
          <div className="saved-analyses-grid">
            {savedListQuery.data.map((item) => (
              <div key={item.id} className="saved-analysis-card">
                <div className="saved-card-top"><span className="mono-label"># {item.id} · {new Date(item.createdAt).toLocaleTimeString()}</span><span className={`saved-decision ${item.decision === "accept" ? "saved-accept" : "saved-rollback"}`}>{item.decision.toUpperCase()}</span></div>
                <h5>{item.name}</h5>
                <div className="saved-card-stats"><span><strong>{item.nodeCount}</strong> nodes</span><span><strong>{item.edgeCount}</strong> edges</span><span><strong>ε</strong> {Number(item.epsilon).toFixed(3)}</span></div>
                <button className="saved-load-button" onClick={() => {
                  try {
                    const parsedPayload = JSON.parse(item.payloadJson);
                    if (parsedPayload && parsedPayload.graph && parsedPayload.graph.edges) {
                      const dataset = parseGraphPayload(parsedPayload);
                      setAnalysis({ ...dataset, currentDispersion: Number(item.currentDispersion), candidateDispersion: Number(item.candidateDispersion), accepted: item.decision === "accept" });
                      setFileName(item.name);
                    }
                  } catch (e) {
                    console.error("Failed to reload payload", e);
                  }
                }}>Reload into lab <Workflow size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="site-shell docs-shell">
      <header className="site-nav">
        <Link href="/" className="brand-lockup">
          <span className="brand-orbit-mark" aria-hidden="true"><span /></span>
          <span>ONSOUR</span>
        </Link>
        <nav className="nav-links" aria-label="Documentation sections">
          <Link href="/theory" className="nav-link-doc">Theory</Link>
          {docSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={activeSection === sec.id ? "is-active-doc-link" : ""}
            >
              {sec.label.split(" / ")[1]}
            </button>
          ))}
        </nav>
        <Link href="/" className="nav-cta">
          <ArrowLeft size={15} /> Back to presentation
        </Link>
      </header>

      <div className="container docs-container">
        <aside className="docs-sidebar">
          <div className="sidebar-sticky">
            <span className="mono-label">TECHNICAL SPECIFICATION</span>
            <h3>UIPT Runtime Manual</h3>
            <p className="sidebar-sub">Revision 3.4 — Production Core Engine</p>
            <nav className="sidebar-nav">
              <Link href="/theory" className="sidebar-theory-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: 'var(--accent-cyan)', fontWeight: 500, fontSize: '0.85rem', textDecoration: 'none', borderRadius: '4px', marginBottom: '8px', background: 'rgba(30, 160, 170, 0.08)' }}>
                <ChevronRight size={14} />
                <span>Theory Foundation</span>
              </Link>
              {docSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={activeSection === sec.id ? "active" : ""}
                >
                  <ChevronRight size={14} />
                  <span>{sec.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-callout">
              <span className="mono-label">REPOSITORY</span>
              <a href="https://github.com/hadiranweb/onsour-unified" target="_blank" rel="noreferrer" className="repo-link">
                <Code2 size={16} /> hadiranweb/onsour-unified
              </a>
            </div>
          </div>
        </aside>

        <article className="docs-content">
          <div className="docs-header">
            <div className="eyebrow"><span className="eyebrow-pulse" /> SYSTEM MANUAL / UIPT-CORE</div>
            <h1>ONSOUR Runtime &amp;<br /><span>Governance Architecture</span></h1>
            <p className="hero-lede">Complete engineering specification for the Rust backend core, state dispersion filters, EMA telemetry sanitization, and authoritative replay buffers.</p>
            <div className="docs-signal-band"><span className="signal-label">PIPELINE</span><span className="signal-node signal-node-cyan" /><span className="signal-line" /><span className="signal-node signal-node-amber" /><span className="signal-line short" /><span className="signal-node signal-node-cyan" /><span className="signal-label signal-label-right">STATE / 0042</span></div>
          </div>

          <section id="overview" className="doc-section">
            <div className="doc-section-tag">01 / ARCHITECTURE OVERVIEW</div>
            <h2>Tripartite Ontology &amp; Memory Layout</h2>
            <p>The ONSOUR engine is structured around a Sovereign Ontology dividing responsibility into three core layers: the Kernel (deterministic graph computation), the Workspace (stochastic node states), and Islands (isolated edge executors). To eliminate cache-line straddling and ensure hardware efficiency, <code>NodePractical</code> structures maintain strict 32-byte alignment.</p>
            <div className="doc-mechanism-strip"><span><Layers size={14} /> KERNEL</span><span><Database size={14} /> WORKSPACE</span><span><Workflow size={14} /> ISLANDS</span></div>
            <div className="spec-table-wrap"><table className="spec-table"><thead><tr><th>Field</th><th>Type</th><th>Bytes</th><th>Constraint</th></tr></thead><tbody><tr><td><code>theta</code></td><td><code>f32</code></td><td>4</td><td>Continuous activation state in [-1, 1]</td></tr><tr><td><code>e</code></td><td><code>f32</code></td><td>4</td><td>Local energy potential E_i</td></tr><tr><td><code>ec</code></td><td><code>f32</code></td><td>4</td><td>Coupling capacitance constant</td></tr><tr><td><code>_padding</code></td><td><code>u32</code></td><td>4</td><td>Explicit alignment padding (32-byte total)</td></tr></tbody></table></div>
          </section>

          <section id="governance" className="doc-section">
            <div className="doc-section-tag">02 / THERMODYNAMIC GOVERNOR</div>
            <h2>State Dispersion &amp; Dynamic Epsilon Adaptation</h2>
            <p>Rather than relying on brittle rule-based policies or ungrounded Shannon entropy formulations over continuous activation states, ONSOUR computes <strong>State Dispersion (D(S))</strong>—defined as the variance of node activations across the graph—to measure systemic disorder.</p>
            <div className="math-block"><div className="math-title">DISPERSION FORMULATION</div><code>D(S) = (1 / N) * Σ (θ_i - μ_θ)²</code><p>Transition rule: <code>D(S_t+1) &lt;= D(S_t) + ε(t)</code></p></div>
            <p>The dynamic threshold ε(t) adapts in real time to system pressure using composite load (Λ) and network latency (ℒ):</p>
            <div className="code-snippet-box"><div className="code-box-top"><span>backend/core/src/governance.rs</span><button onClick={() => copyToClipboard(`let raw_load = (0.5 * metrics.cpu_load + 0.5 * metrics.memory_pressure).clamp(0.0, 1.0);\nlet raw_latency = (metrics.network_latency_ms / 100.0).clamp(0.0, 2.0);\n\nself.smoothed_load = self.ema_alpha * raw_load + (1.0 - self.ema_alpha) * self.smoothed_load;\nself.smoothed_latency = self.ema_alpha * raw_latency + (1.0 - self.ema_alpha) * self.smoothed_latency;\n\nlet num = (1.0 - 0.4 * self.smoothed_load).clamp(0.1, 1.0);\nlet den = (1.0 + 0.2 * self.smoothed_latency).clamp(0.5, f32::INFINITY);\n\nlet adjusted = self.base_epsilon * (num / den);\nadjusted.clamp(self.min_epsilon, self.max_epsilon)`, "governance-code")}>{copiedCode === "governance-code" ? <Check size={14} /> : <Copy size={14} />}{copiedCode === "governance-code" ? "Copied" : "Copy snippet"}</button></div><pre><code>{`let raw_load = (0.5 * metrics.cpu_load + 0.5 * metrics.memory_pressure).clamp(0.0, 1.0);\nlet raw_latency = (metrics.network_latency_ms / 100.0).clamp(0.0, 2.0);\n\nself.smoothed_load = self.ema_alpha * raw_load + (1.0 - self.ema_alpha) * self.smoothed_load;\nself.smoothed_latency = self.ema_alpha * raw_latency + (1.0 - self.ema_alpha) * self.smoothed_latency;\n\nlet num = (1.0 - 0.4 * self.smoothed_load).clamp(0.1, 1.0);\nlet den = (1.0 + 0.2 * self.smoothed_latency).clamp(0.5, f32::INFINITY);\n\nlet adjusted = self.base_epsilon * (num / den);\nadjusted.clamp(self.min_epsilon, self.max_epsilon)`}</code></pre></div>
          </section>

          <section id="execution" className="doc-section"><div className="doc-section-tag">03 / DUAL-BUFFER GRAPH KERNEL</div><h2>Deterministic Gather/Apply &amp; Atomic Rollback</h2><p>To eliminate race conditions and ensure bit-exact determinism across thread counts, the Rayon execution engine enforces a strict two-phase separation:</p><ul className="doc-list"><li><strong>Phase 1 (Gather):</strong> Read-only access to <code>State(t)</code>. Incoming edges are grouped by destination and sorted by source index to guarantee deterministic reduction order.</li><li><strong>Phase 2 (Apply):</strong> Embarrassingly parallel updates to <code>State(t+1)</code>. Each node is written by exactly one worker thread.</li><li><strong>Atomic Rollback:</strong> If <code>apply_governance</code> detects that candidate dispersion exceeds <code>D(S_t) + ε</code>, <code>next_nodes.copy_from_slice(current_nodes)</code> executes instantly.</li></ul></section>

          <section id="replay" className="doc-section"><div className="doc-section-tag">04 / LOGICAL TIME &amp; REPLAY</div><h2>Decoupling Telemetry from Deterministic Memory</h2><p>System clocks (<code>Instant</code>) are non-deterministic and vary across hardware. ONSOUR replaces wall-clock time with <strong>Logical Timestamps</strong> (<code>LogicalTimestamp &#123; epoch_number, tick_within_epoch &#125;</code>).</p><p>Every epoch produces an <strong>Authoritative Governance Snapshot</strong> recording the exact ε utilized. During replay, the system bypasses live telemetry and uses the recorded epsilon, ensuring exact trajectory reproducibility.</p></section>

          <section id="api" className="doc-section"><div className="doc-section-tag">05 / CORE API &amp; RUST SPECS</div><h2>Module Reference &amp; Public Exports</h2><div className="code-snippet-box"><div className="code-box-top"><span>backend/core/src/lib.rs</span><button onClick={() => copyToClipboard(`pub use state::{Node, NodePractical, Edge};\npub use graph::{step_sparse_impl as step_sparse, step_sparse_buffered, step_sparse_js};\npub use math::{alpha, step_node, step_node_math};\npub use governance::{ThermodynamicGovernor, SystemMetrics, LogicalTimestamp, GovernanceSnapshot};`, "lib-code")}>{copiedCode === "lib-code" ? <Check size={14} /> : <Copy size={14} />}{copiedCode === "lib-code" ? "Copied" : "Copy snippet"}</button></div><pre><code>{`pub use state::{Node, NodePractical, Edge};\npub use graph::{step_sparse_impl as step_sparse, step_sparse_buffered, step_sparse_js};\npub use math::{alpha, step_node, step_node_math};\npub use governance::{ThermodynamicGovernor, SystemMetrics, LogicalTimestamp, GovernanceSnapshot};`}</code></pre></div><div className="docs-cta-card"><div><h3>Ready to inspect the codebase?</h3><p>Clone the unified monorepo or run test suites locally via Cargo.</p></div><a href="https://github.com/hadiranweb/onsour-unified" target="_blank" rel="noreferrer" className="button button-primary">View GitHub Repository</a></div></section>

          <section id="lab" className="doc-section doc-section-lab"><div className="doc-section-tag">06 / LIVE DISPERSION LAB</div><h2>Upload a graph. Inspect the barrier.</h2><p>Use this browser-only instrument to test the governance rule against your own state transition. The input is validated locally, reduced to node activation values, and never transmitted to a server.</p><LiveDispersionLab copiedCode={copiedCode} copyToClipboard={copyToClipboard} /></section>
        </article>
      </div>

      <footer className="site-footer"><div className="container footer-row"><div className="footer-brand"><span className="brand-orbit-mark" aria-hidden="true"><span /></span><span>ONSOUR</span></div><span className="footer-note">Technical Manual &amp; Specification v3.4</span><span className="footer-meta">© 2026 / UIPT RESEARCH GROUP</span></div></footer>
    </div>
  );
}
