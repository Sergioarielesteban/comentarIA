export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-terracotta/30 border-t-terracotta"
        aria-hidden
      />
      {label ? <p className="text-sm text-ink-soft">{label}</p> : null}
    </div>
  );
}
