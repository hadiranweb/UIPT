import { describe, expect, it } from "vitest";
import { developerDocSections } from "@/data/developerDocs";
import { globalCommands, searchGlobalCommands } from "@/data/globalCommands";

describe("global command registry", () => {
  it("contains platform routes, theory sections, and all Engine Specs anchors", () => {
    expect(globalCommands.some((command) => command.href === "/")).toBe(true);
    expect(globalCommands.some((command) => command.href === "/docs#lab")).toBe(true);

    const theoryHrefs = globalCommands
      .filter((command) => command.group === "theory")
      .map((command) => command.href);
    expect(theoryHrefs).toEqual([
      "/theory#core-discovery",
      "/theory#three-phases",
      "/theory#observatory",
      "/theory#mathematical-framework",
      "/theory#theory-to-runtime",
    ]);

    const engineHrefs = globalCommands
      .filter((command) => command.group === "engine")
      .map((command) => command.href);
    expect(engineHrefs).toEqual([
      "/docs#overview",
      "/docs#governance",
      "/docs#execution",
      "/docs#replay",
      "/docs#api",
      "/docs#lab",
    ]);
  });

  it("finds technical concepts through aliases and keywords", () => {
    expect(searchGlobalCommands("Landau-Ginzburg").map((command) => command.id)).toEqual(
      expect.arrayContaining(["theory-observatory", "theory-mathematical-framework"]),
    );
    expect(searchGlobalCommands("Rayon").map((command) => command.id)).toEqual(
      expect.arrayContaining(["theory-to-runtime", "engine-execution"]),
    );
    expect(searchGlobalCommands("epsilon").map((command) => command.id)).toEqual(
      expect.arrayContaining(["theory-mathematical-framework", "engine-governance"]),
    );
    expect(searchGlobalCommands("persistence").map((command) => command.id)).toContain("engine-replay");
  });

  it("normalizes Developer Hub destinations to real Docs anchors", () => {
    expect(developerDocSections.map((section) => section.linkTarget)).toEqual([
      "/docs#api",
      "/docs#execution",
      "/docs#replay",
      "/docs#governance",
    ]);
    expect(developerDocSections.some((section) => section.linkTarget.includes("#contracts"))).toBe(false);
    expect(developerDocSections.some((section) => section.linkTarget.includes("#rayon"))).toBe(false);
    expect(developerDocSections.some((section) => section.linkTarget.includes("#persistence"))).toBe(false);
  });
});
