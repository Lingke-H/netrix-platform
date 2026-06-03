import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("merges Tailwind classes predictably", () => {
    expect(cn("px-3", "px-6", "text-slate-900")).toContain("px-6");
  });
});
