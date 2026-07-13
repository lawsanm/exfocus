import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";

describe("DifficultyBadge", () => {
  it("renders the human-readable label for a known difficulty", () => {
    render(<DifficultyBadge difficulty="VERY_HARD" />);
    expect(screen.getByText("Very hard")).toBeInTheDocument();
  });

  it("renders each difficulty level with its own label", () => {
    const cases: Array<[string, string]> = [
      ["EASY", "Easy"],
      ["MEDIUM", "Medium"],
      ["HARD", "Hard"],
    ];
    for (const [value, label] of cases) {
      const { unmount } = render(<DifficultyBadge difficulty={value} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("falls back to the raw value for an unknown difficulty", () => {
    render(<DifficultyBadge difficulty="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
