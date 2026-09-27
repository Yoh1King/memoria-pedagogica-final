export function TypeBars({ items }: { items: Array<{ label: string; count: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{item.label}</span>
            <span className="text-muted-foreground">{item.count}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary/80"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
