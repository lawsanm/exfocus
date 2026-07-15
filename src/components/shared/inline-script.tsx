/**
 * Runs `html` synchronously during HTML parsing, before first paint, so
 * client-only state (e.g. localStorage) can correct server-rendered DOM
 * without a flash. On client-side navigations the script renders as
 * text/plain and is ignored — the owning Client Component re-renders with
 * the real client value instead. Pattern from the Next.js guide
 * "Preventing Flash Before Hydration".
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
