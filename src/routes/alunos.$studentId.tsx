import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RecordFilters } from "@/components/RecordFilters";
import { RecordList, EmptyRecords } from "@/components/RecordList";
import { useApp } from "@/lib/store";
import { getClass, getStudent, studentRecords, withinDays } from "@/lib/selectors";
import { applyFilters, emptyFilters } from "@/lib/filters";

export const Route = createFileRoute("/alunos/$studentId")({
  head: () => ({
    meta: [
      { title: "Aluno — Memória Pedagógica" },
      { name: "description", content: "Histórico de observações registradas sobre o aluno." },
      { property: "og:title", content: "Aluno — Memória Pedagógica" },
      {
        property: "og:description",
        content: "Histórico de observações registradas sobre o aluno.",
      },
    ],
  }),
  component: StudentPage,
});

function StudentPage() {
  const { studentId } = Route.useParams();
  const { ready, data } = useApp();
  const [filters, setFilters] = useState(emptyFilters());

  if (!ready) return null;

  const student = getStudent(data, studentId);
  if (!student) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-medium">Este aluno não está mais disponível.</p>
        <Button asChild className="mt-4">
          <Link to="/turmas">Voltar para turmas</Link>
        </Button>
      </div>
    );
  }

  const cls = getClass(data, student.classId);
  const records = studentRecords(data, student.id);
  const filtered = applyFilters(data, records, filters);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/turmas" className="underline-offset-4 hover:underline">
          Turmas
        </Link>
        {cls && (
          <>
            {" → "}
            <Link
              to="/turmas/$classId"
              params={{ classId: cls.id }}
              className="underline-offset-4 hover:underline"
            >
              {cls.name}
            </Link>
          </>
        )}
        {" → "}
        <span className="text-foreground">{student.name}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{student.name}</h1>
          {cls && (
            <p className="text-muted-foreground">
              {cls.name} — {cls.subject}
            </p>
          )}
          <p className="mt-2 text-sm">
            {records.length} registros no total •{" "}
            {records.filter((r) => withinDays(r, 30)).length} registros nos últimos 30 dias
          </p>
        </div>
        <Button asChild>
          <Link to="/registros/novo" search={{ aluno: student.id }}>
            + Novo Registro para {student.name.split(" ")[0]}
          </Link>
        </Button>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Histórico de observações</h2>
        <RecordFilters
          value={filters}
          onChange={setFilters}
          showClass={false}
          showStudent={false}
          scopeClassId={student.classId}
        />
        {records.length === 0 ? (
          <EmptyRecords
            message="Você ainda não possui registros para este aluno."
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
          <RecordList records={filtered} showClass={false} />
        )}
      </section>
    </div>
  );
}
