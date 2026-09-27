import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClassFormDialog } from "@/components/ClassFormDialog";
import { useApp } from "@/lib/store";
import { classRecords, classStudents, withinDays } from "@/lib/selectors";
import { SHIFTS, type SchoolClass } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/turmas/")({
  validateSearch: (search: Record<string, unknown>): { nova?: boolean } =>
    search["nova"] ? { nova: true } : {},
  head: () => ({
    meta: [
      { title: "Turmas — Memória Pedagógica" },
      { name: "description", content: "Gerencie suas turmas e acesse seus registros." },
      { property: "og:title", content: "Turmas — Memória Pedagógica" },
      { property: "og:description", content: "Gerencie suas turmas e acesse seus registros." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const { ready, data, addClass, updateClass, setArchived, deleteClass } = useApp();
  const { nova } = Route.useSearch();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(Boolean(nova));
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [archiving, setArchiving] = useState<SchoolClass | null>(null);
  const [deleting, setDeleting] = useState<SchoolClass | null>(null);
  const [created, setCreated] = useState<SchoolClass | null>(null);
  const [shift, setShift] = useState<string>("Todas");
  const [query, setQuery] = useState("");

  if (!ready) return null;

  const matches = (c: SchoolClass) =>
    `${c.name} ${c.subject}`.toLowerCase().includes(query.trim().toLowerCase());

  const active = data.classes.filter(
    (c) => !c.archived && matches(c) && (shift === "Todas" || c.shift === shift),
  );
  const archived = data.classes.filter((c) => c.archived && matches(c));

  const Meta = ({ c }: { c: SchoolClass }) => (
    <>
      <p className="mt-1 text-sm text-muted-foreground">
        {c.shift}
        {c.days.length > 0 ? ` • ${c.days.join(", ")}` : ""}
      </p>
      <p className="mt-2 text-sm">{classStudents(data, c.id).length} alunos</p>
      <p className="text-sm text-muted-foreground">
        {classRecords(data, c.id).filter((r) => withinDays(r, 30)).length} registros nos últimos 30
        dias
      </p>
    </>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Turmas</h1>
          <p className="text-muted-foreground">Gerencie suas turmas e acesse seus registros.</p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Nova turma</Button>
      </header>

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="arquivadas">Arquivadas</TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {["Todas", ...SHIFTS].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShift(s)}
                className={cn(
                  "rounded-full border border-border px-3 py-1.5 text-sm",
                  shift === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-accent",
                )}
              >
                {s}
              </button>
            ))}
            <Input
              className="sm:max-w-56"
              placeholder="Buscar turma"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
              <p className="font-medium">Nenhuma turma ativa encontrada.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie uma nova turma ou altere os filtros de busca.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((c) => (
                <div key={c.id} className="relative">
                  <Link
                    to="/turmas/$classId"
                    params={{ classId: c.id }}
                    className="block rounded-xl border border-border bg-card p-4 pr-12 transition-colors hover:bg-secondary"
                  >
                    <p className="font-medium">
                      {c.name} — {c.subject}
                    </p>
                    <Meta c={c} />
                  </Link>
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Opções da turma">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(c)}>
                          Editar turma
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setArchiving(c)}>
                          Arquivar turma
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeleting(c)}>
                          Excluir turma
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="arquivadas" className="space-y-4 pt-4">
          {archived.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
              <p className="font-medium">Você ainda não arquivou turmas.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Turmas arquivadas continuam disponíveis aqui com seus alunos e registros.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {archived.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Turma arquivada
                  </span>
                  <Link
                    to="/turmas/$classId"
                    params={{ classId: c.id }}
                    className="mt-1 block font-medium underline-offset-4 hover:underline"
                  >
                    {c.name} — {c.subject}
                  </Link>
                  <Meta c={c} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setArchived(c.id, false);
                        toast.success("Turma reativada");
                      }}
                    >
                      Reativar turma
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleting(c)}>
                      Excluir definitivamente
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ClassFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="Nova turma"
        submitLabel="Criar turma"
        onSubmit={(values) => {
          const cls = addClass(values);
          setCreating(false);
          setCreated(cls);
        }}
      />

      {editing && (
        <ClassFormDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          initial={editing}
          title="Editar turma"
          submitLabel="Salvar alterações"
          onSubmit={(values) => {
            updateClass(editing.id, values);
            setEditing(null);
            toast.success("Turma atualizada");
          }}
        />
      )}

      <Dialog open={Boolean(created)} onOpenChange={(open) => !open && setCreated(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turma criada!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Agora você pode adicionar os alunos.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreated(null)}>
              Fazer depois
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (created)
                  void navigate({
                    to: "/turmas/$classId",
                    params: { classId: created.id },
                    search: { aba: "alunos", acao: "importar" },
                  });
                setCreated(null);
              }}
            >
              Importar lista
            </Button>
            <Button
              onClick={() => {
                if (created)
                  void navigate({
                    to: "/turmas/$classId",
                    params: { classId: created.id },
                    search: { aba: "alunos", acao: "adicionar" },
                  });
                setCreated(null);
              }}
            >
              + Adicionar aluno
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(archiving)} onOpenChange={(o) => !o && setArchiving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Ela deixará de aparecer entre suas turmas ativas, mas seus alunos e registros
              continuarão disponíveis no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (archiving) setArchived(archiving.id, true);
                setArchiving(null);
                toast.success("Turma arquivada");
              }}
            >
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              A turma, seus alunos e registros serão removidos. Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteClass(deleting.id);
                setDeleting(null);
                toast.success("Turma excluída");
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
