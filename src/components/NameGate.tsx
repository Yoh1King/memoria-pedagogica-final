import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

export function NameGate({ children }: { children: ReactNode }) {
  const { ready, onboarded, completeOnboarding } = useApp();
  const [name, setName] = useState("");

  if (!ready) return null;
  if (onboarded) return <>{children}</>;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-2xl font-semibold">Bem-vindo ao Memória Pedagógica</h1>
      <p className="mt-2 text-muted-foreground">Como podemos te chamar?</p>
      <form
        className="mt-5 space-y-3 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          completeOnboarding(name.trim());
        }}
      >
        <Label htmlFor="seu-nome">Seu nome</Label>
        <Input
          id="seu-nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Ana"
        />
        <Button type="submit" className="w-full" disabled={!name.trim()}>
          Continuar
        </Button>
      </form>
    </section>
  );
}
