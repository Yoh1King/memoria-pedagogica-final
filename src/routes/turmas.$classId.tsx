import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SummaryCard } from "@/components/SummaryCard";
import { AttentionInfo } from "@/components/AttentionInfo";
import { TypeBars } from "@/components/TypeBars";
import { RecordList, EmptyRecords } from "@/components/RecordList";
import { RecordFilters } from "@/components/RecordFilters";
import { ClassFormDialog } from "@/components/ClassFormDialog";
import { ImportStudentsDialog } from "@/components/ImportStudentsDialog";
import { useApp } from "@/lib/store";
import {
  classRecords,
  classStudents,
  countAttention,
  countPositive,
  getClass,
  studentRecords,
  studentsInRecords,
  typeCounts,
  withinDays,
} from "@/lib/selectors";
import { applyFilters, emptyFilters } from "@/lib/filters";
import { typeLabel, type Student } from "@/lib/types";

type Tab = "panorama" | "alunos" | "registros";
type Acao = "adicionar" | "importar";

export const Route = createFileRoute("/turmas/$classId")({
  validateSearch: (search: Record<string, unknown>): { aba?: Tab; acao?: Acao } => {
    const aba = search["aba"];
    const acao = search["acao"];
    return {
      ...((["panorama", "alunos", "registros"] as string[]).includes(aba as string)
        ? { aba: aba as Tab }
        : {}),
      ...((["adicionar", "importar"] as string[]).includes(acao as string)
        ? { acao: acao as Acao }
        : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Turma — Memória Pedagógica" },
      { name: "description", content: "Panorama, alunos e registros da turma." },
      { property: "og:title", content: "Turma — Memória Pedagógica" },
      { property: "og:description", content: "Panorama, alunos e registros da turma." },
    ],
  }),
  component: ClassPage,
});

function ClassPage() {
  const { classId } = Route.useParams();
  const { aba, acao } = Route.useSearch();
  const navigate = useNavigate();
  const { ready, data, updateClass, setArchived, deleteClass, addStudent } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters());

  useEffect(() => {
    if (acao === "adicionar") setAddOpen(true);
    if (acao === "importar") setImportOpen(true);
  }, [acao]);

  if (!ready) return null;

  const cls = getClass(data, classId);
  if (!cls) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-medium">Esta turma não está mais disponível.</p>
        <Button asChild className="mt-4">
          <Link to="/turmas">Voltar para turmas</Link>
        </Button>
      </div>
    );
  }

  const students = classStudents(data, classId);
  const records = classRecords(data, classId);
  const last30 = records.filter((r) => withinDays(r, 30));
  const recentStudents = studentsInRecords(data, last30);
  const filtered = applyFilters(data, records, filters);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/turmas" className="underline-offset-4 hover:underline">
          Turmas
        </Link>
        {" → "}
        <span className="text-foreground">{cls.name}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {cls.archived && (
            <span className="mb-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              Turma arquivada
            </span>
          )}
          <h1 className="text-2xl font-semibold">
            {cls.name} — {cls.subject}
          </h1>
          <p className="text-muted-foreground">
            {cls.shift} • {students.length} {students.length === 1 ? "aluno" : "alunos"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/registros/novo" search={{ turma: cls.id }}>
              + Novo Registro
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Opções da turma">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>Editar</DropdownMenuItem>
              {cls.archived ? (
                <DropdownMenuItem
                  onSelect={() => {
                    setArchived(cls.id, false);
                    toast.success("Turma reativada");
                  }}
                >
                  Reativar turma
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>Arquivar</DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs
        value={aba ?? "panorama"}
        onValueChange={(v) =>
          navigate({ to: "/turmas/$classId", params: { classId }, search: { aba: v as Tab } })
        }
      >
        <TabsList>
          <TabsTrigger value="panorama">Panorama</TabsTrigger>
          <TabsTrigger value="alunos">Alunos</TabsTrigger>
          <TabsTrigger value="registros">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="panorama" className="space-y-6 pt-4">
          {records.length === 0 ? (
            <EmptyRecords
              message="Ainda não há registros nesta turma."
              hint="Quando você registrar observações, o panorama desta turma aparecerá aqui."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Registros (últimos 30 dias)" value={last30.length} />
                <SummaryCard
                  label="Pontos de atenção (últimos 30 dias)"
                  value={countAttention(last30)}
                  extra={<AttentionInfo />}
                />
                <SummaryCard
                  label="Observações positivas (últimos 30 dias)"
                  value={countPositive(last30)}
                />
              </div>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold">O que tenho observado</h2>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
                <div className="mt-4">
                  <TypeBars items={typeCounts(last30)} />
                </div>
              </section>

              {recentStudents.length > 0 && (
                <section className="space-y-3">
                  <h2 className="font-semibold">Alunos nos registros recentes</h2>
                  <div className="flex flex-wrap gap-2">
                    {recentStudents.map(({ student, count }) => (
                      <Link
                        key={student.id}
                        to="/alunos/$studentId"
                        params={{ studentId: student.id }}
                        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                      >
                        {student.name}
                        <span className="ml-2 text-muted-foreground">
                          {count} {count === 1 ? "registro" : "registros"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h2 className="font-semibold">Registros recentes</h2>
                <RecordList records={records.slice(0, 5)} showClass={false} />
              </section>
            </>
          )}
        </TabsContent>

        <TabsContent value="alunos" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">
              Alunos <span className="text-muted-foreground">({students.length})</span>
            </h2>
            <div className="flex gap-2">
              <Button onClick={() => setAddOpen(true)}>+ Adicionar aluno</Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                Importar lista
              </Button>
            </div>
          </div>

          {students.length > 0 && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar aluno"
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
              />
            </div>
          )}

          {students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
              <p className="font-medium">Esta turma ainda não tem alunos.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione os alunos para registrar observações individuais.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => setAddOpen(true)}>+ Adicionar aluno</Button>
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  Importar lista
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {students
                .filter((s) => s.name.toLowerCase().includes(studentQuery.trim().toLowerCase()))
                .map((s) => (
                  <StudentCard key={s.id} student={s} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="registros" className="space-y-4 pt-4">
          <RecordFilters
            value={filters}
            onChange={setFilters}
            showClass={false}
            scopeClassId={classId}
          />
          {records.length === 0 ? (
            <EmptyRecords
              message="Ainda não há registros nesta turma."
              hint="Registre uma observação feita em aula para começar o histórico desta turma."
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
        </TabsContent>
      </Tabs>

      <ClassFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={cls}
        title="Editar turma"
        submitLabel="Salvar alterações"
        onSubmit={(values) => {
          updateClass(cls.id, values);
          setEditOpen(false);
          toast.success("Turma atualizada");
        }}
      />

      <ImportStudentsDialog classId={cls.id} open={importOpen} onOpenChange={setImportOpen} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar aluno</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="novo-aluno">
              Nome do aluno
            </label>
            <Input
              id="novo-aluno"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: Ana Ferreira"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                const created = addStudent(cls.id, newName.trim());
                if (!created) {
                  toast.error("Este aluno já está cadastrado nesta turma.");
                  return;
                }
                setNewName("");
                setAddOpen(false);
                toast.success("Aluno adicionado");
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar esta turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Os alunos e registros continuam guardados. A turma sai da lista de turmas ativas e
              deixa de aparecer nos números e nas visualizações da página inicial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setArchived(cls.id, true);
                toast.success("Turma arquivada");
              }}
            >
              Arquivar turma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Os alunos e todos os registros desta turma serão apagados. Esta ação não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteClass(cls.id);
                toast.success("Turma excluída");
                navigate({ to: "/turmas" });
              }}
            >
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  const { data, updateStudent, deleteStudent } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(student.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const records = studentRecords(data, student.id);
  const recent = records.slice(0, 2);

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium">{student.name}</h3>
          <p className="text-sm text-muted-foreground">
            {records.length} {records.length === 1 ? "observação" : "observações"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Opções de ${student.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setName(student.name);
                setEditOpen(true);
              }}
            >
              Editar nome
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>Excluir aluno</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {recent.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Recentes:{" "}
          {recent.map((r, i) => (
            <span key={r.id}>
              {i > 0 && " / "}
              {typeLabel(r)} • {r.topic}
            </span>
          ))}
        </p>
      )}

      <Link
        to="/alunos/$studentId"
        params={{ studentId: student.id }}
        className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
      >
        Ver histórico →
      </Link>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                updateStudent(student.id, name.trim());
                setEditOpen(false);
                toast.success("Nome atualizado");
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {student.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {student.name} possui {records.length}{" "}
              {records.length === 1 ? "registro associado" : "registros associados"}. Os registros
              que também se referem a outros alunos continuam guardados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteStudent(student.id);
                toast.success("Aluno excluído");
              }}
            >
              Excluir aluno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
