import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";

type Parsed = { columns: string[]; rows: Array<Record<string, unknown>> };

const NAME_HINTS = ["nome", "aluno", "aluna", "estudante", "name", "student"];

export function ImportStudentsDialog({
  classId,
  open,
  onOpenChange,
}: {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addStudents } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [column, setColumn] = useState<string>("");
  const [error, setError] = useState(false);

  const reset = () => {
    setParsed(null);
    setColumn("");
    setError(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const names = parsed
    ? parsed.rows
        .map((row) => String(row[column] ?? "").trim())
        .filter((n) => n.length > 0 && n.toLowerCase() !== "undefined")
    : [];

  const handleFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const sheet = sheetName ? wb.Sheets[sheetName] : undefined;
      if (!sheet) throw new Error("empty");
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (rows.length === 0) throw new Error("empty");
      const columns = Object.keys(rows[0] ?? {});
      if (columns.length === 0) throw new Error("empty");
      const detected =
        columns.find((c) => NAME_HINTS.some((h) => c.toLowerCase().includes(h))) ?? columns[0];
      setParsed({ columns, rows });
      setColumn(detected ?? "");
      setError(false);
    } catch {
      setParsed(null);
      setError(true);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar alunos</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Envie um arquivo CSV ou Excel (.xlsx) contendo uma coluna com os nomes dos alunos.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <div>
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Selecionar arquivo
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-border bg-secondary p-3 text-sm">
            <p className="font-medium">Não conseguimos ler esta lista.</p>
            <p className="text-muted-foreground">
              Envie um arquivo CSV ou XLSX com uma coluna contendo os nomes dos alunos.
            </p>
          </div>
        )}

        {parsed && (
          <div className="space-y-3">
            {parsed.columns.length > 1 && (
              <div className="space-y-2">
                <Label>Qual coluna contém o nome dos alunos?</Label>
                <Select value={column} onValueChange={setColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsed.columns.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <p className="font-medium">Encontramos {names.length} alunos.</p>
            <ul className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-border bg-secondary p-3 text-sm">
              {names.slice(0, 50).map((n, i) => (
                <li key={`${n}-${i}`}>{n}</li>
              ))}
            </ul>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                disabled={names.length === 0}
                onClick={() => {
                  const { added, skipped } = addStudents(classId, names);
                  toast.success(
                    skipped > 0
                      ? `${added} alunos importados • ${skipped} duplicados ignorados`
                      : `${added} alunos importados`,
                  );
                  reset();
                  onOpenChange(false);
                }}
              >
                Importar {names.length} alunos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
