import { z } from "zod";

export const GRAPH_ANALYSIS_SCHEMA_VERSION = "onsour.graph-analysis.v1" as const;

export const graphNodeV1Schema = z.object({
  id: z.string().min(1),
  theta: z.number().finite(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  energy: z.number().finite().optional(),
  criticalEnergy: z.number().finite().optional(),
});

export const graphEdgeV1Schema = z.object({
  src: z.string().min(1),
  dst: z.string().min(1),
  weight: z.number().finite(),
  lag: z.number().finite().optional(),
});

const uniqueNodeIds = (nodes: Array<{ id: string }>) => {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (ids.has(node.id)) return false;
    ids.add(node.id);
  }
  return true;
};

export const graphDatasetV1Schema = z
  .object({
    schemaVersion: z.literal(GRAPH_ANALYSIS_SCHEMA_VERSION),
    name: z.string().optional(),
    currentNodes: z.array(graphNodeV1Schema),
    candidateNodes: z.array(graphNodeV1Schema).optional(),
    edges: z.array(graphEdgeV1Schema),
  })
  .superRefine((dataset, ctx) => {
    if (!uniqueNodeIds(dataset.currentNodes)) {
      ctx.addIssue({ code: "custom", path: ["currentNodes"], message: "currentNodes must contain unique ids" });
    }

    const currentIds = new Set(dataset.currentNodes.map(node => node.id));
    for (const edge of dataset.edges) {
      if (!currentIds.has(edge.src)) {
        ctx.addIssue({ code: "custom", path: ["edges"], message: `Unknown edge source: ${edge.src}` });
      }
      if (!currentIds.has(edge.dst)) {
        ctx.addIssue({ code: "custom", path: ["edges"], message: `Unknown edge destination: ${edge.dst}` });
      }
    }

    if (dataset.candidateNodes) {
      if (!uniqueNodeIds(dataset.candidateNodes)) {
        ctx.addIssue({ code: "custom", path: ["candidateNodes"], message: "candidateNodes must contain unique ids" });
      }
      const candidateIds = dataset.candidateNodes.map(node => node.id);
      if (candidateIds.length !== currentIds.size || candidateIds.some(id => !currentIds.has(id))) {
        ctx.addIssue({
          code: "custom",
          path: ["candidateNodes"],
          message: "candidateNodes must preserve current node identity and cardinality",
        });
      }
    }
  });

export const executionProvenanceV1Schema = z.object({
  schemaVersion: z.literal(GRAPH_ANALYSIS_SCHEMA_VERSION),
  engine: z.enum(["browser-preview", "rust-native", "rust-wasm"]),
  engineVersion: z.string().min(1),
  numericMode: z.enum(["browser-f64-preview", "fixed-q32", "wasm-fixed-q32"]),
  governanceVersion: z.string().min(1),
  logicalEpoch: z.number().int().nonnegative(),
  source: z.enum(["sample", "upload", "database", "replay"]),
  stateRoot: z.string().min(1).optional(),
  snapshotHash: z.string().min(1).optional(),
});

export const governanceResultV1Schema = z.object({
  currentDispersion: z.number().finite().nonnegative(),
  candidateDispersion: z.number().finite().nonnegative(),
  epsilon: z.number().finite().nonnegative(),
  adaptationMetric: z.number().finite(),
  decision: z.enum(["accept", "rollback", "invalid"]),
  reasonCode: z.string().min(1),
  provenance: executionProvenanceV1Schema,
});

export const graphAnalysisResultV1Schema = z.object({
  schemaVersion: z.literal(GRAPH_ANALYSIS_SCHEMA_VERSION),
  dataset: graphDatasetV1Schema,
  governance: governanceResultV1Schema,
});

export type GraphNodeV1 = z.infer<typeof graphNodeV1Schema>;
export type GraphEdgeV1 = z.infer<typeof graphEdgeV1Schema>;
export type GraphDatasetV1 = z.infer<typeof graphDatasetV1Schema>;
export type ExecutionProvenanceV1 = z.infer<typeof executionProvenanceV1Schema>;
export type GovernanceResultV1 = z.infer<typeof governanceResultV1Schema>;
export type GraphAnalysisResultV1 = z.infer<typeof graphAnalysisResultV1Schema>;

export function normalizeGraphDatasetV1(input: unknown): GraphDatasetV1 {
  if (!input || typeof input !== "object") {
    throw new Error("Graph dataset must be an object");
  }

  const candidate = input as Record<string, unknown>;
  const currentNodes = Array.isArray(candidate.currentNodes) ? candidate.currentNodes : candidate.current_nodes;
  const candidateNodes = Array.isArray(candidate.candidateNodes) ? candidate.candidateNodes : candidate.candidate_nodes;
  const edges = Array.isArray(candidate.edges) ? candidate.edges : [];

  return graphDatasetV1Schema.parse({
    schemaVersion: GRAPH_ANALYSIS_SCHEMA_VERSION,
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    currentNodes,
    candidateNodes,
    edges,
  });
}
