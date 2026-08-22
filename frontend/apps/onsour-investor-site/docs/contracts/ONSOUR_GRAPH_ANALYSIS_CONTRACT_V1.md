# ONSOUR Graph Analysis Contract v1

**Status:** Draft for foundation review  
**Schema version:** `onsour.graph-analysis.v1`  
**Scope:** Browser preview, future WASM execution, persistence and export

## Design rule

این قرارداد یک DTO و مرز versioned است؛ layout داخلی `Node` و `Edge` در Rust مستقیماً به آن نشت نمی‌کند. قرارداد باید داده‌ی معتبر را از داده‌ی قابل‌نمایش جدا کند و mode عددی، engine version و provenance را همراه نتیجه منتقل کند.

## Graph dataset

```ts
type GraphNodeV1 = {
  id: string;
  theta: number;
  label?: string;
  tags?: string[];
  energy?: number;
  criticalEnergy?: number;
};

type GraphEdgeV1 = {
  src: string;
  dst: string;
  weight: number;
  lag?: number;
};

type GraphDatasetV1 = {
  schemaVersion: "onsour.graph-analysis.v1";
  name?: string;
  currentNodes: GraphNodeV1[];
  candidateNodes?: GraphNodeV1[];
  edges: GraphEdgeV1[];
};
```

## Execution metadata

```ts
type ExecutionProvenanceV1 = {
  schemaVersion: "onsour.graph-analysis.v1";
  engine: "browser-preview" | "rust-native" | "rust-wasm";
  engineVersion: string;
  numericMode: "browser-f64-preview" | "fixed-q32" | "wasm-fixed-q32";
  governanceVersion: string;
  logicalEpoch: number;
  source: "sample" | "upload" | "database" | "replay";
  stateRoot?: string;
  snapshotHash?: string;
};
```

## Governance result

```ts
type GovernanceResultV1 = {
  currentDispersion: number;
  candidateDispersion: number;
  epsilon: number;
  adaptationMetric: number;
  decision: "accept" | "rollback" | "invalid";
  reasonCode: string;
  provenance: ExecutionProvenanceV1;
};
```

## Validation rules

| Field | Required rule |
|---|---|
| `schemaVersion` | Must equal a supported version; unknown versions are rejected or migrated explicitly |
| `id`, `src`, `dst` | Non-empty strings; edge endpoints must resolve to known node IDs |
| `theta` | Finite number; the accepted conceptual range and clamp policy must be explicit |
| `weight` | Finite number; negative values are allowed only when the execution mode supports them |
| `candidateNodes` | If present, must preserve node identity and cardinality unless a future schema version says otherwise |
| `logicalEpoch` | Non-negative integer; not replaced by browser wall-clock time |
| dispersion/epsilon | Finite and non-negative unless a versioned policy explicitly defines another domain |
| provenance | Required on persisted results and exports |

## Compatibility policy

The parser must accept the current ONSOUR graph shape (`id`, `theta`, optional `label`/`tags`, and `src`/`dst`/`weight`) and normalize it into v1. Missing optional fields remain absent; no fabricated energy or critical-energy values are inserted. Older saved payloads receive an explicit migration marker rather than silently claiming fixed-point or WASM execution.

## Replay policy

A replay-capable result must include the original normalized dataset, logical epoch, numeric mode, engine version and governance version. A result without those fields can be visualized as historical data but cannot be presented as a deterministic replay.

## Export policy

JSON and CSV exports must include the schema version and execution provenance. PNG/SVG graph exports represent the current visual viewport and are not substitutes for a computational snapshot.

## Future compatibility with GenFlow

GenFlow may consume this contract in a future adapter, but it must not import Rust internal structs or depend on ONSOUR database tables directly. Any future adapter must declare the supported contract versions and preserve provenance fields.
