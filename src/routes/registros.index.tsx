import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordFilters } from "@/components/RecordFilters";
import { RecordList, EmptyRecords } from "@/components/RecordList";
import { useApp } from "@/lib/store";
import { activeRecords, temporalSeries, typeCounts, withinDays } from "@/lib/selectors";
import { ALL, applyFilters, emptyFilters, PERIOD_OPTIONS } from "@/lib/filters";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/ExportDialog";
import { isAttention, isPositive, typeLabel } from "@/lib/types";

export const Route = createFileRoute("/registros/")({
  head: () => ({
    meta: [
      { title: "Registros — Memória Pedagógica" },
      { name: "description", content: "Consulte e encontre suas observações anteriores." },
      { property: "og:title", content: "Registros — Memória Pedagógica" },
      { property: "og:description", content: "Consulte e encontre suas observações anteriores." },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const { ready, data } = useApp();
  const [filters, setFilters] = useState(emptyFilters());
  const [overviewClass, setOverviewClass] = useState(ALL);
  const [overviewPeriod, setOverviewPeriod] = useState("30");
  const [exporting, setExporting] = useState(false);

  if (!ready) return null;

  const all = activeRecords(data);
  const filtered = applyFilters(data, all, filters);

  const overviewRecords = all.filter(
    (r) =>
      (overviewClass === ALL || r.classId === overviewClass) &&
      (overviewPeriod === ALL || withinDays(r, Number(overviewPeriod))),
  );
  const byType = typeCounts(overviewRecords);
  const series = temporalSeries(overviewRecords, overviewPeriod as "7" | "30" | typeof ALL);

  const attentionLabels = new Set(overviewRecords.filter(isAttention).map(typeLabel));
  const positiveLabels = new Set(overviewRecords.filter(isPositive).map(typeLabel));
  const barColor = (label: string) =>
    attentionLabels.has(label)
      ? "var(--terracotta)"
      : positiveLabels.has(label)
        ? "var(--sage)"
        : "var(--muted-foreground)";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Registros</h1>
        <Button onClick={() => setExporting(true)}>Exportar registros</Button>
      </header>
      <ExportDialog open={exporting} onOpenChange={setExporting} />

      <Tabs defaultValue="historico">
        <TabsList>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="visao">Visão geral</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4 pt-4">
          <p className="text-muted-foreground">Consulte e encontre suas observações anteriores.</p>
          <Input
            placeholder="Buscar nos registros..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
          <RecordFilters value={filters} onChange={setFilters} />

          {all.length === 0 ? (
            <EmptyRecords
              message="Você ainda não possui registros."
              hint="Registre uma observação feita em aula para começar a construir seu histórico."
            />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
              <p className="font-medium">Nenhum registro encontrado com esses filtros.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente remover ou alterar algum filtro.
              </p>
            </div>
          ) : (
            <RecordList records={filtered} />
          )}
        </TabsContent>

        <TabsContent value="visao" className="space-y-5 pt-4">
          <div>
            <h2 className="text-lg font-semibold">Visão geral dos registros</h2>
            <p className="text-muted-foreground">
              Visualize como suas observações têm aparecido ao longo do tempo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={overviewClass} onValueChange={setOverviewClass}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as turmas ativas</SelectItem>
                {data.classes
                  .filter((c) => !c.archived)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.subject}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={overviewPeriod} onValueChange={setOverviewPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.filter((p) => p.value !== "90").map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {overviewRecords.length === 0 ? (
            <EmptyRecords
              message="Ainda não há registros neste período."
              hint="Quando você registrar observações, elas aparecerão organizadas aqui."
            />
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">O que tenho observado</h3>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byType} layout="vertical" margin={{ left: 12, right: 16 }}>
                      <CartesianGrid horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={170}
                        tick={{ fontSize: 12 }}
                        stroke="var(--muted-foreground)"
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                        }}
                        formatter={(v: number) => [`${v} registros`, "Total"]}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={4} name="Registros">
                        {byType.map((entry) => (
                          <Cell key={entry.label} fill={barColor(entry.label)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">Observações ao longo do tempo</h3>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ left: 0, right: 16, top: 8 }}>
                      <CartesianGrid stroke="var(--border)" />
                      <XAxis dataKey="label" stroke="var(--muted-foreground)" />
                      <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="atencao"
                        name="Pontos de atenção"
                        stroke="var(--terracotta)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="positivas"
                        name="Observações positivas"
                        stroke="var(--sage)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-terracotta" /> Pontos de atenção
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-sage" /> Observações positivas
                  </span>
                </div>
              </section>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
