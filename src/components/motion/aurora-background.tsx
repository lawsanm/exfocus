/**
 * Ambient aurora backdrop: large, blurred, slowly-drifting gradient orbs.
 * Pure markup + CSS animation (see globals.css); the drift is disabled under
 * prefers-reduced-motion. Absolutely positioned — drop it into a `relative`
 * container behind the content.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}
    >
      <div
        className="aurora-blob aurora-blob-a"
        style={{
          top: "-10%",
          left: "-8%",
          width: "42vw",
          height: "42vw",
          background: "var(--color-chart-1)",
        }}
      />
      <div
        className="aurora-blob aurora-blob-b"
        style={{
          bottom: "-14%",
          right: "-10%",
          width: "46vw",
          height: "46vw",
          background: "var(--color-chart-2)",
        }}
      />
      <div
        className="aurora-blob aurora-blob-c"
        style={{
          top: "30%",
          right: "18%",
          width: "30vw",
          height: "30vw",
          background: "var(--color-chart-5)",
        }}
      />
    </div>
  );
}
