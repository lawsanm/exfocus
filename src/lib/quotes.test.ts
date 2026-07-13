import { describe, expect, it } from "vitest";
import { getQuoteOfTheDay } from "@/lib/quotes";

describe("getQuoteOfTheDay", () => {
  it("returns the same quote for the same day", () => {
    const date = new Date("2026-03-15T09:00:00Z");
    const later = new Date("2026-03-15T21:30:00Z");
    expect(getQuoteOfTheDay(date)).toBe(getQuoteOfTheDay(later));
  });

  it("returns a non-empty string", () => {
    expect(getQuoteOfTheDay(new Date("2026-01-01T00:00:00Z"))).toBeTruthy();
  });

  it("is deterministic across a full year without throwing", () => {
    for (let day = 0; day < 366; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day));
      expect(typeof getQuoteOfTheDay(date)).toBe("string");
    }
  });
});
