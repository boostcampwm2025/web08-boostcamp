export function ShortcutGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground px-1 text-[10px] font-bold tracking-wider uppercase">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
