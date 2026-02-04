export function ShortcutRow({
  label,
  keys,
}: {
  label: string;
  keys: string[];
}) {
  return (
    <div className="hover:bg-muted flex items-center justify-between rounded-sm px-2 py-1 text-xs">
      <span className="text-muted-foreground/90">{label}</span>
      <div className="flex gap-1.5">
        {keys.map((k) => (
          <kbd
            key={k}
            className="bg-muted/50 border-border/40 flex min-w-6 items-center justify-center rounded border px-1.5 py-0.5 font-sans text-[10px] font-medium shadow-sm"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
