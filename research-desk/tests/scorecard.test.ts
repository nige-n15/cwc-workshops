// Copyright 2026 Anthropic PBC
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { csvCell, scorecardsToCsv, validateScorecard, type Scorecard } from "../src/lib/scorecard";

const GOOD: Record<string, unknown> = {
  ticker: "BTC",
  asset_name: "Bitcoin",
  pair: "XBTUSD",
  as_of: "2026-11-03T21:00:00Z",
  price_usd: 77796.0,
  return_7d_pct: -2.1,
  return_30d_pct: 4.8,
  return_90d_pct: -11.3,
  volatility_30d_pct: 41.5,
  volume_24h_usd_k: 170170.0,
  spread_bps: 1.7,
  depth_1pct_usd_k: 2100,
  trend: "range",
  key_risks: ["thin book outside US hours", "macro risk-off"],
  changes_since_last_note: ["first note for this asset"],
  red_flags: [],
  one_line_thesis: "Range-bound with deep USD liquidity.",
  confidence: "medium",
  memory_note_path: "/assets/BTC/2026-11-03.md",
};

describe("validateScorecard", () => {
  it("accepts a complete scorecard", () => {
    const { scorecard, problems } = validateScorecard(GOOD);
    expect(problems).toEqual([]);
    expect(scorecard?.ticker).toBe("BTC");
  });

  it("rejects a scorecard missing required fields", () => {
    const { scorecard, problems } = validateScorecard({ ticker: "BTC" });
    expect(scorecard).toBeNull();
    expect(problems.length).toBeGreaterThan(0);
  });

  it("rejects bad enums and types", () => {
    const { problems } = validateScorecard({ ...GOOD, trend: "moon", price_usd: "lots" });
    expect(problems.join(" ")).toContain("trend");
    expect(problems.join(" ")).toContain("price_usd");
  });

  it("caps list lengths", () => {
    const { scorecard } = validateScorecard({ ...GOOD, key_risks: ["a", "b", "c", "d", "e", "f", "g"] });
    expect(scorecard?.key_risks.length).toBeLessThanOrEqual(5);
  });
});

describe("csv output", () => {
  it("neutralizes formula prefixes in text cells", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(12.5)).toBe(12.5);
    expect(csvCell(["a", "b"])).toBe("a | b");
  });

  it("renders a header plus one row per scorecard", () => {
    const { scorecard } = validateScorecard(GOOD);
    const csv = scorecardsToCsv([scorecard as Scorecard]);
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("ticker");
    expect(lines[1]).toContain("BTC");
  });
});
