import { globalNavItems } from "@/components/globalNavigation";

export type CommandGroup = "platform" | "theory" | "engine";
export type CommandKind = "route" | "section";

export type GlobalCommand = {
  id: string;
  label: string;
  description: string;
  group: CommandGroup;
  kind: CommandKind;
  href: string;
  keywords: string[];
};

const platformCommands: GlobalCommand[] = globalNavItems.map((item) => ({
  id: `route-${item.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}`,
  label: item.label,
  description: item.description,
  group: "platform",
  kind: "route",
  href: item.href === "/lab" ? "/docs#lab" : item.href,
  keywords: [item.label, item.description, item.href],
}));

const theoryCommands: GlobalCommand[] = [
  {
    id: "theory-core-discovery",
    label: "Core Discovery",
    description: "Spontaneous symmetry breaking in intelligence",
    group: "theory",
    kind: "section",
    href: "/theory#core-discovery",
    keywords: ["UIPT", "phase transition", "symmetry", "SSB", "identity", "energy", "theta"],
  },
  {
    id: "theory-three-phases",
    label: "The Three Phases",
    description: "Classical, critical, and quantum-agentic capability",
    group: "theory",
    kind: "section",
    href: "/theory#three-phases",
    keywords: ["UIPT", "classical processor", "criticality", "edge of chaos", "quantum agentic", "phase"],
  },
  {
    id: "theory-observatory",
    label: "Interactive UIPT Observatory",
    description: "Explore potential landscapes and stochastic trajectories",
    group: "theory",
    kind: "section",
    href: "/theory#observatory",
    keywords: ["observatory", "interactive", "Landau-Ginzburg", "Langevin", "tanh", "visualization"],
  },
  {
    id: "theory-mathematical-framework",
    label: "Mathematical Framework",
    description: "Landau-Ginzburg, Langevin, Mean-Field Tanh, and governance equations",
    group: "theory",
    kind: "section",
    href: "/theory#mathematical-framework",
    keywords: ["math", "equation", "Landau-Ginzburg", "potential", "Langevin", "Mean-Field", "tanh", "dispersion", "epsilon"],
  },
  {
    id: "theory-to-runtime",
    label: "Theory to Rust Runtime",
    description: "See how UIPT becomes an executable organism",
    group: "theory",
    kind: "section",
    href: "/theory#theory-to-runtime",
    keywords: ["Rust", "runtime", "Rayon", "WASM", "alignment", "gather", "apply", "governance"],
  },
];

const engineCommands: GlobalCommand[] = [
  {
    id: "engine-overview",
    label: "Architecture Overview",
    description: "Tripartite ontology and runtime memory layout",
    group: "engine",
    kind: "section",
    href: "/docs#overview",
    keywords: ["engine", "architecture", "kernel", "workspace", "islands", "NodePractical", "memory"],
  },
  {
    id: "engine-governance",
    label: "Thermodynamic Governor",
    description: "State dispersion and dynamic epsilon adaptation",
    group: "engine",
    kind: "section",
    href: "/docs#governance",
    keywords: ["governance", "thermodynamic", "dispersion", "epsilon", "EMA", "load", "latency", "rollback"],
  },
  {
    id: "engine-execution",
    label: "Dual-Buffer Graph Kernel",
    description: "Deterministic Rayon Gather/Apply execution",
    group: "engine",
    kind: "section",
    href: "/docs#execution",
    keywords: ["execution", "Rayon", "parallel", "gather", "apply", "double buffer", "deterministic", "race"],
  },
  {
    id: "engine-replay",
    label: "Logical Time & Replay",
    description: "Authoritative snapshots and provenance records",
    group: "engine",
    kind: "section",
    href: "/docs#replay",
    keywords: ["replay", "logical timestamp", "epoch", "provenance", "snapshot", "determinism", "persistence"],
  },
  {
    id: "engine-api",
    label: "Core API & Rust Specs",
    description: "Public exports, contracts, and integration surface",
    group: "engine",
    kind: "section",
    href: "/docs#api",
    keywords: ["API", "Rust", "contracts", "Zod", "schema", "Q32.32", "exports", "integration"],
  },
  {
    id: "engine-live-lab",
    label: "Live Dispersion Lab",
    description: "Upload a graph and inspect the governance barrier",
    group: "engine",
    kind: "section",
    href: "/docs#lab",
    keywords: ["lab", "graph", "upload", "JSON", "CSV", "PNG", "SVG", "dispersion", "tour"],
  },
];

export const globalCommands: GlobalCommand[] = [
  ...platformCommands,
  ...theoryCommands,
  ...engineCommands,
];

export const commandGroupLabels: Record<CommandGroup, string> = {
  platform: "Platform",
  theory: "UIPT Theory",
  engine: "Engine Specifications",
};

export function searchGlobalCommands(query: string, commands = globalCommands) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return commands;

  return commands.filter((command) => {
    const haystack = [command.label, command.description, command.href, ...command.keywords]
      .join(" ")
      .toLowerCase();
    return normalizedQuery.split(/\s+/).every((term) => haystack.includes(term));
  });
}

export function groupCommands(commands: GlobalCommand[]) {
  return (Object.keys(commandGroupLabels) as CommandGroup[]).map((group) => ({
    group,
    label: commandGroupLabels[group],
    commands: commands.filter((command) => command.group === group),
  })).filter((section) => section.commands.length > 0);
}
