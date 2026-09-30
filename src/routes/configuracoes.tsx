import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Memória Pedagógica" },
      { name: "description", content: "Dados da sua conta no Memória Pedagógica." },
      { property: "og:title", content: "Configurações — Memória Pedagógica" },
      { property: "og:description", content: "Dados da sua conta no Memória Pedagógica." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { ready, teacherName, setTeacherName, email, signOut } = useApp();
  const [name, setName] = useState(teacherName);
  const [saving, setSaving] = useState(false);
  useEffect(() => setName(teacherName), [teacherName]);
  if (!ready) return null;

  return (
    <div className="max-w-xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Configurações</h1>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Sua conta</h2>
        <div className="space-y-2">
          <Label htmlFor="professor">Nome</Label>
          <Input id="professor" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conta-email">E-mail</Label>
          <Input id="conta-email" value={email} readOnly disabled />
          <ChangeEmail current={email} />
        </div>
        <Button
          disabled={saving || !name.trim() || name.trim() === teacherName}
          onClick={async () => {
            setSaving(true);
            try {
              await setTeacherName(name);
              toast.success("Alterações salvas");
            } catch {
              /* toast already shown */
            } finally {
              setSaving(false);
            }
          }}
        >
          Salvar alterações
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Sessão</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => signOut()}>
            Sair da conta
          </Button>
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}

function DeleteAccount() {
  const del = useServerFn(deleteMyAccount);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await del();
    } catch {
      toast.error("Não foi possível excluir a conta. Tente novamente.");
      setBusy(false);
      return;
    }
    await supabase.auth.signOut().catch(() => {});
    setOpen(false);
    toast.success("Sua conta foi excluída com sucesso.");
    await navigate({ to: "/" });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        setOpen(o);
        if (!o) setText("");
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente. Sua conta e os dados associados a ela serão excluídos e não
            poderão ser recuperados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirmar-exclusao">Digite EXCLUIR para confirmar</Label>
          <Input
            id="confirmar-exclusao"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" disabled={text !== "EXCLUIR" || busy} onClick={confirm}>
            {busy ? "Excluindo..." : "Excluir conta"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
