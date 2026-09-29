import { useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";

/** Auth gate: shows login/signup when there is no session. */
export function NameGate({ children }: { children: ReactNode }) {
  const { authReady, session } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/redefinir-senha") return <>{children}</>;
  if (!authReady) return null;
  if (session) return <>{children}</>;
  return <AuthScreen />;
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await supabase.auth
      .resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      .catch(() => {});
    setBusy(false);
    setSent(true);
  };
  return (
    <section className="mx-auto mt-10 max-w-md rounded-2xl border border-border bg-card p-8">
      <p className="text-center text-sm font-bold uppercase tracking-[0.14em] text-foreground">
        Memória Pedagógica
      </p>
      <h1 className="mt-4 text-center text-2xl font-semibold">Recuperar senha</h1>
      {sent ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Se existir uma conta associada a este e-mail, você receberá as instruções para redefinir
          sua senha.
        </p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="rec-email">E-mail</Label>
            <Input
              id="rec-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!email.trim() || busy}>
            Enviar instruções
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm">
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-4"
          onClick={onBack}
        >
          Voltar ao login
        </button>
      </p>
    </section>
  );
}

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered|already exists/i.test(msg)) return "Já existe uma conta com este e-mail.";
  if (/at least|weak|pwned|leaked/i.test(msg))
    return "Senha fraca. Use pelo menos 6 caracteres e evite senhas comuns.";
  if (/valid email|invalid.*email/i.test(msg)) return "Informe um e-mail válido.";
  return "Não foi possível concluir. Tente novamente.";
}

function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) toast.error(translate(error.message));
        else await router.navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) toast.error(translate(error.message));
        else if (!data.session) toast.success("Conta criada. Confirme seu e-mail para entrar.");
      }
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    email.trim() && password.length >= 6 && (mode === "login" || name.trim().length > 0);

  return (
    <section className="mx-auto mt-10 max-w-md rounded-2xl border border-border bg-card p-8">
      <p className="text-center text-sm font-bold uppercase tracking-[0.14em] text-foreground">
        Memória Pedagógica
      </p>
      <h1 className="mt-4 text-center text-2xl font-semibold">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="auth-nome">Nome</Label>
            <Input id="auth-nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="auth-email">E-mail</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-senha">Senha</Label>
          <Input
            id="auth-senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={!canSubmit || busy}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "login" ? "Não possui uma conta? " : "Já possui uma conta? "}
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-4"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Criar conta" : "Voltar ao login"}
        </button>
      </p>
    </section>
  );
}
