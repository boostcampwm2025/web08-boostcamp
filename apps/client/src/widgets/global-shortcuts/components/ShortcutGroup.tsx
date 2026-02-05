export function ShortcutGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </h4>
      <div>{children}</div>
    </div>
  );
}
