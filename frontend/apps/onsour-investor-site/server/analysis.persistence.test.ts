import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMock = vi.hoisted(() => ({
  saveAnalysis: vi.fn(),
  listSavedAnalyses: vi.fn(),
  getSavedAnalysisById: vi.fn(),
}));

vi.mock("./db", () => dbMock);

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("analysis persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a complete dispersion analysis payload with epoch history metrics", async () => {
    dbMock.saveAnalysis.mockResolvedValue(42);
    const caller = appRouter.createCaller(createContext());

    const result = await caller.analysis.save({
      epoch: 42,
      name: "epoch-0042",
      nodeCount: 2,
      edgeCount: 1,
      currentDispersion: "0.01000",
      candidateDispersion: "0.01800",
      epsilon: "0.02000",
      adaptationMetric: "0.00800",
      decision: "accept",
      payloadJson: JSON.stringify({
        schema_version: "onsour.dispersion.v1",
        epoch: 42,
        current_nodes: [{ id: "n0", theta: 0.1 }],
        candidate_nodes: [{ id: "n0", theta: 0.12 }],
        graph: { edges: [{ src: "n0", dst: "n1", weight: 0.1 }] },
        governance: { adaptation_metric: 0.008 },
      }),
    });

    expect(result).toEqual({ success: true, id: 42 });
    expect(dbMock.saveAnalysis).toHaveBeenCalledWith(expect.objectContaining({
      epoch: 42,
      name: "epoch-0042",
      nodeCount: 2,
      edgeCount: 1,
      adaptationMetric: "0.00800",
      decision: "accept",
    }));
  });

  it("round-trips a saved analysis through save and reload contracts", async () => {
    const stored = {
      id: 7,
      userId: null,
      epoch: 0,
      name: "round-trip-graph",
      nodeCount: 1,
      edgeCount: 0,
      currentDispersion: "0.01000",
      candidateDispersion: "0.01200",
      epsilon: "0.02000",
      adaptationMetric: "0.00200",
      decision: "accept",
      payloadJson: JSON.stringify({
        schema_version: "onsour.dispersion.v1",
        current_nodes: [{ id: "n0", theta: 0.1 }],
        candidate_nodes: [{ id: "n0", theta: 0.12 }],
        graph: { edges: [] },
        governance: { adaptation_metric: 0.002 },
      }),
      createdAt: new Date("2026-08-18T00:00:00Z"),
    };
    dbMock.saveAnalysis.mockResolvedValue(7);
    dbMock.getSavedAnalysisById.mockResolvedValue(stored);
    const caller = appRouter.createCaller(createContext());

    const saved = await caller.analysis.save({
      epoch: stored.epoch,
      name: stored.name,
      nodeCount: stored.nodeCount,
      edgeCount: stored.edgeCount,
      currentDispersion: stored.currentDispersion,
      candidateDispersion: stored.candidateDispersion,
      epsilon: stored.epsilon,
      adaptationMetric: stored.adaptationMetric,
      decision: stored.decision,
      payloadJson: stored.payloadJson,
    });
    const reloaded = await caller.analysis.get({ id: 7 });

    expect(saved).toEqual({ success: true, id: 7 });
    expect(reloaded).toEqual(stored);
    expect(reloaded?.epoch).toBe(0);
    expect(reloaded?.adaptationMetric).toBe("0.00200");
    expect(JSON.parse(reloaded?.payloadJson ?? "{}").current_nodes[0].id).toBe("n0");
  });

  it("returns persisted analyses for the database feed", async () => {
    const saved = [{
      id: 42,
      userId: null,
      epoch: 42,
      name: "epoch-0042",
      nodeCount: 2,
      edgeCount: 1,
      currentDispersion: "0.01000",
      candidateDispersion: "0.01800",
      epsilon: "0.02000",
      adaptationMetric: "0.00800",
      decision: "accept",
      payloadJson: JSON.stringify({ current_nodes: [], candidate_nodes: [], graph: { edges: [] } }),
      createdAt: new Date("2026-08-18T00:00:00Z"),
    }];
    dbMock.listSavedAnalyses.mockResolvedValue(saved);
    const caller = appRouter.createCaller(createContext());

    const result = await caller.analysis.list();

    expect(result).toEqual(saved);
    expect(result[0].epoch).toBe(42);
    expect(result[0].adaptationMetric).toBe("0.00800");
    expect(dbMock.listSavedAnalyses).toHaveBeenCalledOnce();
  });
});
