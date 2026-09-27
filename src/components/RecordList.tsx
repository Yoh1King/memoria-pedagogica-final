import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { RecordForm, type RecordDraft } from "@/components/RecordForm";
import { useApp } from "@/lib/store";
import { getClass, groupByDay, recordPeopleLabel } from "@/lib/selectors";
import { dayHeading } from "@/lib/format";
import { typeLabel, isAttention, isPositive, type ObservationRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

function toDraft(r: ObservationRecord): RecordDraft {
  return {
    classId: r.classId,
    date: r.date,
    topic: r.topic,
    type: r.type,
    customType: r.customType ?? "",
    customClassification: r.customClassification ?? "",
    scope: r.scope,
    studentIds: r.studentIds,
    detail: r.detail ?? "",
  };
}

export function RecordList({
  records,
  showClass = true,
}: {
  records: ObservationRecord[];
  showClass?: boolean;
}) {
  const { data, updateRecord, deleteRecord } = useApp();
  const [editing, setEditing] = useState<ObservationRecord | null>(null);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [deleting, setDeleting] = useState<ObservationRecord | null>(null);

  const groups = groupByDay(records);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date} className="space-y-3">
          <h3 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">
            {dayHeading(group.date)}
          </h3>
          <div className="space-y-3">
            {group.records.map((r) => {
              const cls = getClass(data, r.classId);
              return (
                <article
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        isAttention(r)
                          ? "bg-terracotta"
                          : isPositive(r)
                            ? "bg-sage"
                            : "bg-ochre",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{typeLabel(r)}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {showClass && cls ? `${cls.name} — ${cls.subject} • ` : ""}
                        {r.topic}
                      </p>
                      <p className="mt-1 text-sm">{recordPeopleLabel(data, r)}</p>
                      {r.detail ? (
                        <p className="mt-2 text-sm italic text-muted-foreground">“{r.detail}”</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-xs text-muted-foreground">{r.time}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Opções do registro">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(r);
                              setDraft(toDraft(r));
                            }}
                          >
                            Editar registro
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setDeleting(r)}>
                            Excluir registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setDraft(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>
          {editing && draft && (
            <RecordForm
              draft={draft}
              onChange={setDraft}
              submitLabel="Salvar alterações"
              onCancel={() => {
                setEditing(null);
                setDraft(null);
              }}
              onSubmit={() => {
                updateRecord(editing.id, {
                  classId: draft.classId,
                  date: draft.date,
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
                setEditing(null);
                setDraft(null);
                toast.success("Registro atualizado");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro será removido do seu histórico. Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteRecord(deleting.id);
                setDeleting(null);
                toast.success("Registro excluído");
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

export function EmptyRecords({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
      <p className="font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <Button asChild className="mt-4">
        <Link to="/registros/novo">+ Novo Registro</Link>
      </Button>
    </div>
  );
}
