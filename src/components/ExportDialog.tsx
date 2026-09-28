import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { activeClasses, classStudents, topics as topicsOf } from "@/lib/selectors";
import {
  exportRecords,
  generatePdf,
  type ExportKind,
  type ExportOptions,
  type ExportPeriod,
} from "@/lib/export-pdf";

export function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data } = useApp();
  const classes = activeClasses(data);
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("todos");
  const [kind, setKind] = useState<ExportKind>("todos");
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [period, setPeriod] = useState<ExportPeriod>("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [inc, setInc] = useState({ summary: true, charts: true, history: true });
  const [busy, setBusy] = useState(false);

  const students = classId ? classStudents(data, classId) : [];
  const topicOptions = classId ? topicsOf(data.records.filter((r) => r.classId === classId)) : [];

  const opts: ExportOptions = {
    classId,
    studentId,
    kind,
    topics: selTopics,
    period,
    from,
    to,
    includeSummary: inc.summary,
    includeCharts: inc.charts,
    includeHistory: inc.history,
  };
  const records = useMemo(() => exportRecords(data, opts), [data, JSON.stringify(opts)]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTopic = (t: string) =>
    setSelTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const customInvalid = period === "custom" && (!from || !to || from > to);
  const nothingIncluded = !inc.summary && !inc.charts && !inc.history;

  const onGenerate = async () => {
    if (!classId) return toast.error("Selecione uma turma.");
    if (customInvalid) return toast.error("Informe uma data inicial e final válidas.");
    if (nothingIncluded) return toast.error("Marque ao menos um item em “Incluir no PDF”.");
    if (records.length === 0)
      return toast.error("Não existem registros correspondentes aos filtros selecionados.");
    setBusy(true);
    try {
      await generatePdf(data, opts, records);
      toast.success("PDF gerado.");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar registros</DialogTitle>
          <DialogDescription>Escolha quais registros incluir no PDF.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Turma</Label>
            <Select
              value={classId}
              onValueChange={(v) => {
                setClassId(v);
                setStudentId("todos");
                setSelTopics([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Aluno</Label>
            <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os alunos</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de observação</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as ExportKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="atencao">Pontos de atenção</SelectItem>
                <SelectItem value="positiva">Observações positivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Conteúdos</Label>
            {!classId ? (
              <p className="text-sm text-muted-foreground">Selecione uma turma primeiro.</p>
            ) : topicOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum conteúdo registrado nesta turma.</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selTopics.length === 0} onCheckedChange={() => setSelTopics([])} />
                  Todos os conteúdos
                </label>
                {topicOptions.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={selTopics.includes(t)} onCheckedChange={() => toggleTopic(t)} />
                    {t}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Período</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as ExportPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="todos">Todo o período</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">Data inicial</Label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Data final</Label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Incluir no PDF</Label>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["summary", "Resumo"],
                  ["charts", "Gráficos"],
                  ["history", "Histórico detalhado"],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={inc[k]}
                    onCheckedChange={(c) => setInc({ ...inc, [k]: c === true })}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {classId && !customInvalid && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              {records.length === 0
                ? "Não existem registros correspondentes aos filtros selecionados."
                : `${records.length} ${records.length === 1 ? "registro encontrado" : "registros encontrados"}.`}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onGenerate} disabled={busy || !classId}>
            {busy ? "Gerando..." : "Gerar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
