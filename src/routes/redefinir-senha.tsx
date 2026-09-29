import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Memória Pedagógica" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
      { property: "og:title", content: "Redefinir senha — Memória Pedagógica" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const query = window.location.search;
    if (/error/.test(hash) || /error/.test(query)) {
      setStatus("invalid");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ok");
    });
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setStatus((s) => (s === "ok" ? s : data.session ? "ok" : "invalid"));
    }, 1500);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const goLogin = async () => {
    await supabase.auth.signOut().catch(() => {});
    await navigate({ to: "/" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      if (/at least|weak|pwned|leaked/i.test(error.message))
        toast.error("Senha fraca. Use pelo menos 6 caracteres e evite senhas comuns.");
      else if (/different from the old|same/i.test(error.message))
        toast.error("A nova senha deve ser diferente da anterior.");
      else if (/session|expired|jwt/i.test(error.message)) setStatus("invalid");
      else toast.error("Não foi possível redefinir a senha. Tente novamente.");
      return;
    }
    await supabase.auth.signOut().catch(() => {});
    toast.success("Senha redefinida com sucesso. Entre com sua nova senha.");
    await navigate({ to: "/" });
  };

  return (
    <section className="mx-auto mt-10 max-w-md rounded-2xl border border-border bg-card p-8">
      <p className="text-center text-sm font-bold uppercase tracking-[0.14em] text-foreground">
        Memória Pedagógica
      </p>
      <h1 className="mt-4 text-center text-2xl font-semibold">Redefinir senha</h1>
      {status === "checking" && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Verificando link...</p>
      )}
      {status === "invalid" && (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Este link de recuperação é inválido ou expirou. Volte ao login e use “Esqueceu sua
            senha?” para solicitar um novo link.
          </p>
          <Button className="w-full" onClick={goLogin}>
            Voltar ao login
          </Button>
        </div>
      )}
      {status === "ok" && (
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
            <Input
              id="confirmar-senha"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={password.length < 6 || !confirm || busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </section>
  );
}
