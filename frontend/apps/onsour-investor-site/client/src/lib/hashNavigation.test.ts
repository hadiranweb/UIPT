import { afterEach, describe, expect, it, vi } from "vitest";
import { scrollToHash, splitHref } from "@/lib/hashNavigation";

describe("hash navigation", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    vi.restoreAllMocks();
  });

  it("splits route and hash destinations without losing route-only hrefs", () => {
    expect(splitHref("/theory#mathematical-framework")).toEqual({ path: "/theory", hash: "mathematical-framework" });
    expect(splitHref("/docs#api")).toEqual({ path: "/docs", hash: "api" });
    expect(splitHref("/")).toEqual({ path: "/", hash: "" });
  });

  it("scrolls the resolved target with the requested behavior", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { requestAnimationFrame: vi.fn() },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { getElementById: vi.fn(() => ({ scrollIntoView })) },
    });

    scrollToHash("governance", "auto");

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("retries after rendering when the target is not available on the first pass", () => {
    const scrollIntoView = vi.fn();
    const frames: FrameRequestCallback[] = [];
    let lookupCount = 0;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { requestAnimationFrame: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; } },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById: vi.fn(() => {
          lookupCount += 1;
          return lookupCount > 1 ? { scrollIntoView } : null;
        }),
      },
    });

    scrollToHash("api", "smooth", 1);
    expect(frames).toHaveLength(1);
    frames.shift()?.(0);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });
});
