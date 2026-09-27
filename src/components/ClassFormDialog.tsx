import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SHIFTS, WEEKDAYS, type SchoolClass, type Shift } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ClassFormValues = {
  name: string;
  subject: string;
  shift: Shift;
  days: string[];
};

export function ClassFormDialog({
  open,
  onOpenChange,
  initial,
  title,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SchoolClass;
  title: string;
  submitLabel: string;
  onSubmit: (values: ClassFormValues) => void;
}) {
  const [values, setValues] = useState<ClassFormValues>({
    name: "",
    subject: "",
    shift: "Manhã",
    days: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? "",
        subject: initial?.subject ?? "",
        shift: initial?.shift ?? "Manhã",
        days: initial?.days ?? [],
      });
      setError("");
    }
  }, [open, initial]);

  const toggleDay = (day: string) =>
    setValues((v) => ({
      ...v,
      days: v.days.includes(day) ? v.days.filter((d) => d !== day) : [...v.days, day],
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!values.name.trim() || !values.subject.trim()) {
              setError("Preencha o nome da turma e a disciplina.");
              return;
            }
            if (values.days.length === 0) {
              setError("Selecione pelo menos um dia da semana.");
              return;
            }
            onSubmit({ ...values, name: values.name.trim(), subject: values.subject.trim() });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da turma *</Label>
            <Input
              id="nome"
              placeholder="6º Ano A"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disciplina">Disciplina *</Label>
            <Input
              id="disciplina"
              placeholder="Matemática"
              value={values.subject}
              onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Turno *</Label>
            <div className="flex flex-wrap gap-2">
              {SHIFTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, shift: s }))}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-sm",
                    values.shift === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-accent",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dias da semana *</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-sm",
                    values.days.includes(d)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-accent",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
