export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <div className="skeleton" style={{ height: 36, width: "40%" }} />
      <div className="skeleton" style={{ height: 16, width: "60%", marginTop: 12 }} />
      <div className="skeleton" style={{ height: 220, marginTop: 24, borderRadius: 20 }} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
