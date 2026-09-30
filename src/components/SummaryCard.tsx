import type { ReactNode } from "react";

export function SummaryCard({
  label,
  value,
  extra,
  valueColor,
}: {
  valueColor?: string;
  label: string;
  value: number | string;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{label}</span>
        {extra}
      </div>
      <p className="mt-2 text-3xl font-semibold" style={valueColor ? { color: valueColor } : undefined}>{value}</p>
    </div>
  );
}
