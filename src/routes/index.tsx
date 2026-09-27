import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AttentionInfo } from "@/components/AttentionInfo";
import { SummaryCard } from "@/components/SummaryCard";
import { useApp } from "@/lib/store";
import {
  activeClasses,
  activeRecords,
  classRecords,
  classStudents,
  countAttention,
  getClass,
  recordPeopleLabel,
  withinDays,
} from "@/lib/selectors";
import { relativeDayTime } from "@/lib/format";
import { typeLabel } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Memória Pedagógica" },
      {
        name: "description",
        content: "Resumo das suas turmas ativas e das observações registradas recentemente.",
      },
      { property: "og:title", content: "Início — Memória Pedagógica" },
      {
        property: "og:description",
        content: "Resumo das suas turmas ativas e das observações registradas recentemente.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { ready, data, teacherName } = useApp();
  if (!ready) return null;

  const classes = activeClasses(data);

  if (classes.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold">Bem-vindo ao Memória Pedagógica</h1>
        <p className="mt-2 text-muted-foreground">
          Comece criando sua primeira turma para organizar suas observações de aula.
        </p>
        <Button asChild className="mt-5">
          <Link to="/turmas" search={{ nova: true }}>
            + Criar primeira turma
          </Link>
        </Button>
        <ol className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {["Crie sua turma", "Adicione seus alunos", "Registre suas observações"].map(
            (step, i) => (
              <li key={step} className="rounded-xl border border-border bg-secondary p-4 text-sm">
                <span className="text-xs text-muted-foreground">Passo {i + 1}</span>
                <p className="mt-1 font-medium">{step}</p>
              </li>
            ),
          )}
        </ol>
      </section>
    );
  }

  const recent = activeRecords(data).filter((r) => withinDays(r, 30));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">
          Olá{teacherName.trim() ? `, ${teacherName.trim()}.` : "!"}
        </h1>
        <p className="text-muted-foreground">Um resumo das suas observações recentes.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Turmas ativas" value={classes.length} />
        <SummaryCard label="Registros nos últimos 30 dias" value={recent.length} />
        <SummaryCard
          label="Pontos de atenção nos últimos 30 dias"
          value={countAttention(recent)}
          extra={<AttentionInfo />}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Minhas turmas</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => {
            const count = classRecords(data, c.id).filter((r) => withinDays(r, 30)).length;
            return (
              <Link
                key={c.id}
                to="/turmas/$classId"
                params={{ classId: c.id }}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                <p className="font-medium">
                  {c.name} — {c.subject}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.shift} • {classStudents(data, c.id).length} alunos
                </p>
                <p className="mt-2 text-sm">{count} registros recentes</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Observações recentes</h2>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="font-medium">Você ainda não possui registros.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre uma observação feita em aula para começar a construir seu histórico.
            </p>
            <Button asChild className="mt-4">
              <Link to="/registros/novo">+ Novo Registro</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.slice(0, 4).map((r) => {
              const cls = getClass(data, r.classId);
              return (
                <article key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-medium">{typeLabel(r)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {cls?.name} • {r.topic}
                  </p>
                  <div className="mt-1 flex flex-wrap justify-between gap-2 text-sm">
                    <span>{recordPeopleLabel(data, r)}</span>
                    <span className="text-muted-foreground">
                      {relativeDayTime(r.date, r.time)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <Link to="/registros" className="inline-block text-sm underline underline-offset-4">
          Ver todos os registros →
        </Link>
      </section>
    </div>
  );
}
