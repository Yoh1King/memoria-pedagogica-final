import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { activeClasses, classRecords, classStudents, topics } from "@/lib/selectors";
import { OBSERVATION_TYPES, type CustomClassification, type ObservationType } from "@/lib/types";
import { todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

export type RecordDraft = {
  classId: string;
  date: string;
  topic: string;
  type: ObservationType;
  customType: string;
  customClassification: CustomClassification | "";
  scope: "class" | "students";
  studentIds: string[];
  detail: string;
};

export function emptyDraft(partial?: Partial<RecordDraft>): RecordDraft {
  return {
    classId: "",
    date: todayISO(),
    topic: "",
    type: "Dificuldade de compreensão",
    customType: "",
    customClassification: "",
    scope: "class",
    studentIds: [],
    detail: "",
    ...partial,
  };
}

export function RecordForm({
  draft,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Salvar registro",
  lockClass = false,
}: {
  draft: RecordDraft;
  onChange: (d: RecordDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  lockClass?: boolean;
}) {
  const { data } = useApp();
  const [errors, setErrors] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState("");

  const classes = useMemo(() => {
    const list = activeClasses(data);
    const current = data.classes.find((c) => c.id === draft.classId);
    return current && current.archived ? [...list, current] : list;
  }, [data, draft.classId]);

  const students = draft.classId ? classStudents(data, draft.classId) : [];
  const suggestions = draft.classId ? topics(classRecords(data, draft.classId)) : [];

  const set = (patch: Partial<RecordDraft>) => onChange({ ...draft, ...patch });

  const validate = () => {
    const e: string[] = [];
    if (!draft.classId) e.push("Escolha a turma do registro.");
    if (!draft.date) e.push("Informe a data da observação.");
    if (!draft.topic.trim()) e.push("Informe o conteúdo/assunto da aula.");
    if (draft.type === "Outro" && !draft.customType.trim())
      e.push("Descreva o tipo de observação.");
    if (draft.type === "Outro" && !draft.customClassification)
      e.push("Classifique a observação como Ponto de atenção ou Observação positiva.");
    if (draft.scope === "students" && draft.studentIds.length === 0)
      e.push("Selecione pelo menos um aluno.");
    setErrors(e);
    return e.length === 0;
  };

  const toggleStudent = (id: string) => {
    set({
      studentIds: draft.studentIds.includes(id)
        ? draft.studentIds.filter((s) => s !== id)
        : [...draft.studentIds, id],
    });
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (validate()) onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Turma *</Label>
          <Select
            value={draft.classId}
            onValueChange={(v) => set({ classId: v, studentIds: [] })}
            disabled={lockClass}
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

        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            type="date"
            value={draft.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conteudo">Conteúdo/assunto *</Label>
        <Input
          id="conteudo"
          list="sugestoes-conteudo"
          placeholder="Ex.: Frações"
          value={draft.topic}
          onChange={(e) => set({ topic: e.target.value })}
        />
        <datalist id="sugestoes-conteudo">
          {suggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label>O que você observou? *</Label>
        <div className="flex flex-wrap gap-2">
          {OBSERVATION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set({ type: t })}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-sm transition-colors",
                draft.type === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {draft.type === "Outro" && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="outro">Descreva o tipo de observação *</Label>
            <Input
              id="outro"
              value={draft.customType}
              onChange={(e) => set({ customType: e.target.value })}
            />
          </div>
        )}
        {draft.type === "Outro" && (
          <div className="space-y-2 pt-2">
            <Label>Como classificar esta observação? *</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "atencao", label: "Ponto de atenção" },
                  { value: "positiva", label: "Observação positiva" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set({ customClassification: opt.value })}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-sm transition-colors",
                    draft.customClassification === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Essa observação se refere a: *</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "class", label: "Turma inteira" },
              { value: "students", label: "Aluno(s)" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ scope: opt.value })}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-sm transition-colors",
                draft.scope === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {draft.scope === "students" && (
          <div className="space-y-3 rounded-xl border border-border bg-secondary/60 p-3">
            {draft.studentIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.studentIds.map((id) => {
                  const student = students.find((s) => s.id === id);
                  if (!student) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm"
                    >
                      {student.name}
                      <button
                        type="button"
                        aria-label={`Remover ${student.name}`}
                        onClick={() => toggleStudent(id)}
                      >
                        <X className="size-3.5 text-muted-foreground" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta turma ainda não possui alunos cadastrados.
              </p>
            ) : (
              <>
                <Input
                  placeholder="Buscar aluno"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                />
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        draft.studentIds.includes(s.id)
                          ? "bg-card font-medium"
                          : "hover:bg-card/70",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="px-1 py-2 text-sm text-muted-foreground">
                      Nenhum aluno encontrado com esse nome.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="detalhe">
          Quer acrescentar algum detalhe?{" "}
          <span className="font-normal text-muted-foreground">(Opcional)</span>
        </Label>
        <Textarea
          id="detalhe"
          rows={3}
          placeholder="Ex.: apresentou dificuldade principalmente nas operações com denominadores diferentes."
          value={draft.detail}
          onChange={(e) => set({ detail: e.target.value })}
        />
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-terracotta/40 bg-secondary p-3 text-sm text-terracotta">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
