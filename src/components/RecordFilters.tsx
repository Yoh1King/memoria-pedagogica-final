import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ALL, PERIOD_OPTIONS, emptyFilters, type FilterState } from "@/lib/filters";
import { useApp } from "@/lib/store";
import { activeClasses, classStudents, topics } from "@/lib/selectors";
import { OBSERVATION_TYPES, typeLabel } from "@/lib/types";

export function RecordFilters({
  value,
  onChange,
  showClass = true,
  showStudent = true,
  scopeClassId,
}: {
  value: FilterState;
  onChange: (f: FilterState) => void;
  showClass?: boolean;
  showStudent?: boolean;
  scopeClassId?: string;
}) {
  const { data } = useApp();
  const classes = activeClasses(data);
  const classIdForStudents = scopeClassId ?? (value.classId !== ALL ? value.classId : "");
  const students = classIdForStudents
    ? classStudents(data, classIdForStudents)
    : [...data.students].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const relevantRecords = data.records.filter((r) =>
    scopeClassId ? r.classId === scopeClassId : true,
  );
  const topicOptions = topics(relevantRecords);
  const customTypes = [
    ...new Set(relevantRecords.filter((r) => r.type === "Outro").map((r) => typeLabel(r))),
  ];
  const typeOptions = [...OBSERVATION_TYPES.filter((t) => t !== "Outro"), ...customTypes];

  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showClass && (
        <Select
          value={value.classId}
          onValueChange={(v) => set({ classId: v, studentId: ALL })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as turmas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} — {c.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showStudent && (
        <Select value={value.studentId} onValueChange={(v) => set({ studentId: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Aluno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os alunos</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={value.type} onValueChange={(v) => set({ type: v })}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Tipo de observação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os tipos</SelectItem>
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.topic} onValueChange={(v) => set({ topic: v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Conteúdo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os conteúdos</SelectItem>
          {topicOptions.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.period} onValueChange={(v) => set({ period: v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(emptyFilters({ query: value.query }))}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
