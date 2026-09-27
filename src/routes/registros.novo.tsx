import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RecordForm, emptyDraft, type RecordDraft } from "@/components/RecordForm";
import { useApp } from "@/lib/store";
import { getClass, getStudent } from "@/lib/selectors";
import { nowTime } from "@/lib/format";

export const Route = createFileRoute("/registros/novo")({
  validateSearch: (search: Record<string, unknown>): { turma?: string; aluno?: string } => ({
    ...(typeof search["turma"] === "string" ? { turma: search["turma"] } : {}),
    ...(typeof search["aluno"] === "string" ? { aluno: search["aluno"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Novo registro — Memória Pedagógica" },
      { name: "description", content: "Registre rapidamente algo que você observou na aula." },
      { property: "og:title", content: "Novo registro — Memória Pedagógica" },
      {
        property: "og:description",
        content: "Registre rapidamente algo que você observou na aula.",
      },
    ],
  }),
  component: NewRecordPage,
});

function NewRecordPage() {
  const { ready, data, addRecord } = useApp();
  const { turma, aluno } = Route.useSearch();
  const navigate = useNavigate();

  const student = aluno ? getStudent(data, aluno) : undefined;
  const classId = student?.classId ?? turma ?? "";

  const [draft, setDraft] = useState<RecordDraft>(() =>
    emptyDraft({
      classId,
      ...(student ? { scope: "students" as const, studentIds: [student.id] } : {}),
    }),
  );
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  const cls = draft.classId ? getClass(data, draft.classId) : undefined;

  if (saved) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-lg font-semibold">✓ Registro salvo</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              setDraft((d) => ({
                ...d,
                type: "Dificuldade de compreensão",
                customType: "",
                customClassification: "",
                scope: "class",
                studentIds: [],
                detail: "",
              }));
              setSaved(false);
            }}
          >
            + Registrar outra observação desta aula
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/registros">Ver registros</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        {cls && (
          <p className="text-sm text-muted-foreground">
            {cls.name} — {cls.subject}
            {student ? ` • ${student.name}` : ""}
          </p>
        )}
        <h1 className="text-2xl font-semibold">Novo registro</h1>
        <p className="text-muted-foreground">
          Registre rapidamente algo que você observou na aula.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <RecordForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => void navigate({ to: "/registros" })}
          onSubmit={() => {
            addRecord({
              classId: draft.classId,
              date: draft.date,
              time: nowTime(),
              topic: draft.topic.trim(),
              type: draft.type,
              customType: draft.type === "Outro" ? draft.customType.trim() : "",
              customClassification:
                draft.type === "Outro" && draft.customClassification
                  ? draft.customClassification
                  : undefined,
              scope: draft.scope,
              studentIds: draft.scope === "students" ? draft.studentIds : [],
              detail: draft.detail.trim(),
            });
            setSaved(true);
          }}
        />
      </div>
    </div>
  );
}
