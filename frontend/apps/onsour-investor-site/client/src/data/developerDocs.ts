export type DocSection = {
  id: string;
  title: string;
  category: string;
  summary: string;
  targetAudience: "Systems Engineer" | "Frontend Developer" | "Protocol Researcher";
  readTime: string;
  codeSnippet?: string;
  linkTarget: string;
};

export const developerDocSections: DocSection[] = [
  {
    id: "zod-contracts",
    title: "Versioned Zod Graph Analysis v1 Contracts",
    category: "Data Validation & Schemas",
    summary: "Guarantees invariant node properties, edge source/destination boundaries, and engine provenance metadata before transmission.",
    targetAudience: "Frontend Developer",
    readTime: "4 min read",
    codeSnippet: `import { z } from "zod";\n\nexport const GraphAnalysisV1Schema = z.object({\n  schemaVersion: z.literal("v1"),\n  engineVersion: z.string(),\n  numericMode: z.enum(["Q32.32", "Float64"]), \n  nodesCount: z.number().int().nonnegative(),\n});`,
    linkTarget: "/docs#api",
  },
  {
    id: "rayon-kernel",
    title: "Rust Rayon Parallel Execution Pipeline",
    category: "High-Performance Runtime",
    summary: "Thread-safe gather/apply separation, double-buffered state isolation, and Q32.32 fixed-point quantization.",
    targetAudience: "Systems Engineer",
    readTime: "7 min read",
    codeSnippet: `pub fn step_sparse_buffered(\n    current: &State,\n    next: &mut State,\n    neighbors: &[Vec<usize>]\n) -> Result<(), KernelError>`,
    linkTarget: "/docs#execution",
  },
  {
    id: "trpc-persistence",
    title: "tRPC Persistence & Provenance Routers",
    category: "API & Backend",
    summary: "Type-safe procedures for saving and loading dispersion analyses with full provenance tracking and epoch history.",
    targetAudience: "Frontend Developer",
    readTime: "5 min read",
    codeSnippet: `export const analysisRouter = createTRPCRouter({\n  save: protectedProcedure\n    .input(saveAnalysisSchema)\n    .mutation(async ({ ctx, input }) => { ... }),\n});`,
    linkTarget: "/docs#replay",
  },
  {
    id: "thermodynamic-governance",
    title: "Dynamic Thermodynamic Epsilon Governance",
    category: "Homeostasis Protocol",
    summary: "Adaptive barrier tuning based on real-time composite load factors, EMA smoothing, and atomic rollback triggers.",
    targetAudience: "Protocol Researcher",
    readTime: "6 min read",
    codeSnippet: `const computeEpsilon = (load: number, baseEpsilon: number) => {\n  const smoothLoad = emaFilter.update(load);\n  return Math.max(0.01, baseEpsilon * (1 - smoothLoad * 0.5));\n};`,
    linkTarget: "/docs#governance",
  },
];
