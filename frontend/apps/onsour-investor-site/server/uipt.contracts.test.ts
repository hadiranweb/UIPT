import { describe, expect, it } from "vitest";
import {
  GRAPH_ANALYSIS_SCHEMA_VERSION,
  executionProvenanceV1Schema,
  governanceResultV1Schema,
  normalizeGraphDatasetV1,
} from "../shared/uipt-contracts";

describe("UIPT graph-analysis v1 contracts", () => {
  it("normalizes the current ONSOUR camelCase graph payload", () => {
    const dataset = normalizeGraphDatasetV1({
      name: "sample-epoch-0001",
      currentNodes: [
        { id: "kernel", theta: 0.2, label: "Kernel", tags: ["core"] },
        { id: "field", theta: -0.1 },
      ],
      candidateNodes: [
        { id: "kernel", theta: 0.25 },
        { id: "field", theta: -0.05 },
      ],
      edges: [{ src: "kernel", dst: "field", weight: 0.4 }],
    });

    expect(dataset.schemaVersion).toBe(GRAPH_ANALYSIS_SCHEMA_VERSION);
    expect(dataset.currentNodes).toHaveLength(2);
    expect(dataset.edges[0]).toMatchObject({ src: "kernel", dst: "field" });
  });

  it("accepts legacy snake_case node arrays while preserving the v1 boundary", () => {
    const dataset = normalizeGraphDatasetV1({
      current_nodes: [{ id: "a", theta: 0 }],
      candidate_nodes: [{ id: "a", theta: 0.1 }],
      edges: [],
    });

    expect(dataset.schemaVersion).toBe(GRAPH_ANALYSIS_SCHEMA_VERSION);
    expect(dataset.candidateNodes?.[0].id).toBe("a");
  });

  it("rejects edges that point to unknown nodes", () => {
    expect(() =>
      normalizeGraphDatasetV1({
        currentNodes: [{ id: "a", theta: 0 }],
        edges: [{ src: "a", dst: "missing", weight: 1 }],
      })
    ).toThrow(/Unknown edge destination/);
  });

  it("rejects candidate state that changes node identity or cardinality", () => {
    expect(() =>
      normalizeGraphDatasetV1({
        currentNodes: [
          { id: "a", theta: 0 },
          { id: "b", theta: 0 },
        ],
        candidateNodes: [{ id: "a", theta: 0.2 }],
        edges: [],
      })
    ).toThrow(/candidateNodes must preserve/);
  });

  it("requires explicit provenance for governance results", () => {
    const provenance = executionProvenanceV1Schema.parse({
      schemaVersion: GRAPH_ANALYSIS_SCHEMA_VERSION,
      engine: "browser-preview",
      engineVersion: "onsour-web-baseline",
      numericMode: "browser-f64-preview",
      governanceVersion: "governance-v1",
      logicalEpoch: 1,
      source: "sample",
    });

    const result = governanceResultV1Schema.parse({
      currentDispersion: 0.2,
      candidateDispersion: 0.21,
      epsilon: 0.05,
      adaptationMetric: 0.01,
      decision: "accept",
      reasonCode: "within-epsilon-barrier",
      provenance,
    });

    expect(result.provenance.numericMode).toBe("browser-f64-preview");
    expect(result.decision).toBe("accept");
  });
});
