import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Memória Pedagógica" },
      {
        name: "description",
        content: "Identificação do professor e ambientes de demonstração e teste.",
      },
      { property: "og:title", content: "Configurações — Memória Pedagógica" },
      {
        property: "og:description",
        content: "Identificação do professor e ambientes de demonstração e teste.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { ready, teacherName, setTeacherName, env, setEnv, resetDemo } = useApp();
  if (!ready) return null;

  return (
    <div className="max-w-xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Configurações</h1>
      </header>

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <Label htmlFor="professor">Seu nome</Label>
        <Input
          id="professor"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Usado apenas na saudação da página inicial.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div>
          <h2 className="font-semibold">Recursos de demonstração</h2>
          <p className="text-sm text-muted-foreground">
            O ambiente de demonstração usa dados fictícios. O ambiente de teste começa vazio e
            guarda separadamente tudo o que você criar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "demo", label: "Ambiente de demonstração" },
              { value: "test", label: "Ambiente de teste" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setEnv(opt.value);
                toast.success(`Você está no ${opt.label.toLowerCase()}.`);
              }}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-sm",
                env === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {env === "demo" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetDemo();
              toast.success("Dados de demonstração restaurados");
            }}
          >
            Restaurar dados de demonstração
          </Button>
        )}
      </section>
    </div>
  );
}
