import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Button variant="outline" onClick={() => signOut()}>
          Sair da conta
        </Button>
      </section>
    </div>
  );
}
